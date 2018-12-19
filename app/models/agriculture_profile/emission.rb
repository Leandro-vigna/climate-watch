module AgricultureProfile
  class Emission < ApplicationRecord
    belongs_to :emission_subcategory, :class_name => 'AgricultureProfile::EmissionSubcategory'
    belongs_to :location

    validates_presence_of :values
    validates_uniqueness_of :emission_subcategory_id, scope: :location_id

    scope :by_location, ->(location_id) { where(location_id: location_id)}
  end
end