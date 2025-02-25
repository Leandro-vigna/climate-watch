require 'rails_helper'
# rubocop:disable LineLength

RSpec.describe ImportZipFiles do
  subject { ImportZipFiles.new.call(upload_files: false) }

  let(:object_contents) do
    {
      "#{CW_FILES_PREFIX}zip_files/zip_files.csv" => <<~END,
        "drop_down","zip_file","metadata","s3_folder","file_name_raw","file_name_zip"
        "ALL DATA","ClimateWatch_AllData.zip",,,,,
        "NDC CONTENT","ClimateWatch_NDC_Content.zip",,"indc","NDC_metadata.csv","CW_NDC_metadata.csv"
        "NDC CONTENT","ClimateWatch_NDC_Content.zip","2020_NDC","indc","NDC_single_version.csv","CW_NDC_tracker.csv"
        "NDC CONTENT","ClimateWatch_NDC_Content.zip","NDC_WB
        NDC_DIE
        NDC_CW","indc","NDC_data.csv","CW_NDC_data_highlevel.csv"
        "LTS CONTENT","ClimateWatch_LTS.zip","NDC_LTS","indc","NDC_LTS_data.csv","CW_LTS_data_highlevel.csv"
        "LTS CONTENT","ClimateWatch_LTS.zip",,"indc","NDC_LTS_data_sectoral.csv","CW_LTS_data_sector.csv"
        "PATHWAYS","ClimateWatch_Pathways.zip",,,,,
      END
      "#{CW_FILES_PREFIX}indc/NDC_metadata.csv" => <<~END,
        global_category,overview_category,map_category,column_name,long_name,Definition,Source,multiple_version
        Overview,UNFCCC Process,Other,domestic_approval,Domestic Approval Processes Category,,CAIT,TRUE
        Mitigation,Target,,M_TarYr,Target year,The year by which mitigation objectives are expected to be achieved,WB,TRUE
      END
      "#{CW_FILES_PREFIX}indc/NDC_data.csv" => <<~END,
        country,ISO,document, domestic_approval,domestic_approval_label
        Afghanistan,AFG,indc, Executive + majority of two legislative bodies,Executive + majority of two legislative bodies/super-majority of one legislative body
      END
      "#{CW_FILES_PREFIX}indc/NDC_single_version.csv" => <<~END,
        Country,ISO,submission,submission_label,submission_date
        Afghanistan,AFG,First NDC Submitted,First NDC Submitted,11/23/2016
      END
      "#{CW_FILES_PREFIX}wri_metadata/metadata_sources.csv" => <<~END,
        ﻿dataset,title
        2020_NDC,title
        NDC_WB,title
        NDC_DIE,title
        NDC_CW,title
        NDC_LTS,title
      END
      "#{CW_FILES_PREFIX}climate-watch-download-zip/ClimateWatch_Pathways.zip" => <<~END,
        zipfilecontent
      END
    }
  end

  before :each do
    Aws.config[:s3] = {
      stub_responses: {
        list_objects: {
          contents: [
            {key: "#{CW_FILES_PREFIX}zip_files/zip_files.csv"}
          ]
        },
        get_object: lambda { |context|
          {body: object_contents[context.params[:key]]}
        },
        head_object: lambda { |_context|
          {content_length: 10}
        }
      }
    }
  end

  after :each do
    Aws.config[:s3] = {
      stub_responses: nil
    }
  end

  it 'Creates new zip files records' do
    allow_any_instance_of(Kernel).to receive(:puts) # suppress puts message

    expect { subject }.to change { ZipFile.count }.by(4)

    z1 = ZipFile.find_by(dropdown_title: 'ALL DATA')
    z2 = ZipFile.find_by(dropdown_title: 'NDC CONTENT')
    z3 = ZipFile.find_by(dropdown_title: 'LTS CONTENT')
    z4 = ZipFile.find_by(dropdown_title: 'PATHWAYS')

    expect(z1.zip_filename).to eq('ClimateWatch_AllData.zip')
    expect(z1.metadata).to eq([])
    expect(z1.files).to eq([])

    expect(z2.zip_filename).to eq('ClimateWatch_NDC_Content.zip')
    expect(z2.metadata).to eq(%w(2020_NDC NDC_WB NDC_DIE NDC_CW))
    expect(z2.files.map(&:symbolize_keys)).to eq(
      [
        {s3_folder: 'indc', filename_original: 'NDC_metadata.csv', filename_zip: 'CW_NDC_metadata.csv'},
        {s3_folder: 'indc', filename_original: 'NDC_single_version.csv', filename_zip: 'CW_NDC_tracker.csv'},
        {s3_folder: 'indc', filename_original: 'NDC_data.csv', filename_zip: 'CW_NDC_data_highlevel.csv'}
      ]
    )
    expect(z3.zip_filename).to eq('ClimateWatch_LTS.zip')
    expect(z3.metadata).to eq(%w(NDC_LTS))
    expect(z3.files.map(&:symbolize_keys)).to eq(
      [
        {s3_folder: 'indc', filename_original: 'NDC_LTS_data.csv', filename_zip: 'CW_LTS_data_highlevel.csv'},
        {s3_folder: 'indc', filename_original: 'NDC_LTS_data_sectoral.csv', filename_zip: 'CW_LTS_data_sector.csv'}
      ]
    )

    expect(z4.zip_filename).to eq('ClimateWatch_Pathways.zip')
    expect(z4.metadata).to eq([])
    expect(z4.files).to eq([])
  end

  context 'with errors' do
    let(:object_contents) do
      {
        "#{CW_FILES_PREFIX}zip_files/zip_files.csv" => <<~END,
          "drop_down","zip_file","metadata","s3_folder","file_name_raw","file_name_zip"
          "NDC CONTENT","ClimateWatch_NDC_Content.zip",,"indc","NDC_metadata.csv","CW_NDC_metadata.csv"
          "NDC CONTENT","ClimateWatch_NDC_Content.zip","2020_NDC","indc","NDC_single_version.csv","CW_NDC_tracker.csv"
          "PATHWAYS","ClimateWatch_Pathways.zip",,,,,
        END
      }
    end

    it 'raises error when ALL DATA entry does not exist' do
      expect { subject }.to raise_error('ALL DATA entry must exist')
    end
  end

  context 'with file generate and upload' do
    subject { ImportZipFiles.new.call }

    it 'Generate Zip files and upload them' do
      allow_any_instance_of(Kernel).to receive(:puts) # suppress puts message

      uploaded_files = []

      Aws.config[:s3] = Aws.config[:s3].deep_merge(
        stub_responses: {
          put_object: lambda { |context|
            uploaded_files << {
              name: File.basename(context.params[:body].to_path),
              content: File.read(context.params[:body])
            }
            {etag: 'etag'}
          }
        }
      )

      subject

      expect(uploaded_files.map { |f| f[:name] }).to eq(['ClimateWatch_NDC_Content.zip', 'ClimateWatch_LTS.zip', 'ClimateWatch_AllData.zip'])

      all_data_file = uploaded_files.find { |f| f[:name].include?('AllData.zip') }

      Zip::File.open_buffer(all_data_file[:content]) do |zipfile|
        expect(zipfile.entries.map(&:name)).to eq(['ClimateWatch_NDC_Content.zip', 'ClimateWatch_LTS.zip', 'ClimateWatch_Pathways.zip'])
      end

      ndc_content_file = uploaded_files.find { |f| f[:name].include?('NDC_Content.zip') }

      Zip::File.open_buffer(ndc_content_file[:content]) do |zipfile|
        expect(zipfile.entries.map(&:name)).to eq(['CW_NDC_metadata.csv', 'CW_NDC_tracker.csv', 'CW_NDC_data_highlevel.csv', 'metadata.csv'])
        metadata_file = zipfile.entries.find { |f| f.name == 'metadata.csv' }
        metadata_csv_content = metadata_file.get_input_stream.read
        saved_metadata = []
        CSV.parse(metadata_csv_content, headers: true).each do |row|
          saved_metadata << row['dataset']
        end
        expect(saved_metadata).to eq(%w(2020_NDC NDC_WB NDC_DIE NDC_CW))
      end

      expect(ZipFile.first.byte_size).to eq(10) # file size is set in stub response
    end
  end
end

# rubocop:enable LineLength
