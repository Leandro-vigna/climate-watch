module Api
  module V1
    module Data
      class NdcContentZippedDownload
        attr_reader :filename

        def initialize(filter)
          @filter = filter
          @metadata_filter = Api::V1::Data::MetadataFilter.new(
            source_names: %w(ndc_cait ndc_wb)
          )
          @filename = 'ndc_content'
          @metadata_filename = 'sources.csv'
        end

        def call
          zipped_download = Api::V1::Data::ZippedDownload.new(@filename)
          zipped_download.add_file_content(
            Api::V1::Data::NdcContentCsvContent.new(@filter).call,
            @filename + '.csv'
          )
          zipped_download.add_file_content(
            Api::V1::Data::MetadataCsvContent.new(@metadata_filter).call,
            @metadata_filename
          )
          zipped_download.call
        end
      end
    end
  end
end
