class CaitIndc::Indicator < ApplicationRecord
  before_save :set_slug

  belongs_to :chart, class_name: 'CaitIndc::Chart', optional: true
  belongs_to :indicator_type, class_name: 'CaitIndc::IndicatorType'
  belongs_to :category, class_name: 'CaitIndc::Category', optional: true
  has_many :indicator_labels, class_name: 'CaitIndc::IndicatorLabel'
  has_many :location_indicator_values, class_name: 'CaitIndc::LocationIndicatorValue'
  validates :name, presence: true

  def set_slug
    self.slug = self.name.downcase.strip.gsub(/ /, '_').gsub(/\W/, '')
  end
end
