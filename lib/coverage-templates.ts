import { CoverageTemplate, CoverageType } from '@/types';

export const coverageTemplates: Record<CoverageType, CoverageTemplate> = {
  homeowners: {
    title: '🏠 Homeowners Insurance',
    fields: [
      { id: 'policy_number', label: 'Policy Number', type: 'text', placeholder: 'HO123456789' },
      { id: 'property_address', label: 'Property Address', type: 'text', required: true, placeholder: '123 Main St' },
      { id: 'city_state_zip', label: 'City, State, ZIP', type: 'text', placeholder: 'Naples, FL 34102' },
      { id: 'policy_term', label: 'Policy Term', type: 'text', placeholder: '01/01/2025 to 01/01/2026' },
      { id: 'current_carrier', label: 'Current Carrier', type: 'text', placeholder: 'Current Insurance Co.' },
      { id: 'current_premium', label: 'Current/Expiring Annual Premium ($)', type: 'text', required: true, placeholder: '5000.00' },
      { id: 'proposed_carrier', label: 'Proposed/Renewal Carrier', type: 'text', required: true, placeholder: 'PURE Insurance' },
      { id: 'proposed_premium', label: 'Proposed/Renewal Annual Premium ($)', type: 'text', required: true, placeholder: '5250.00' },
      { id: 'dwelling_coverage', label: 'Dwelling Coverage', type: 'text', placeholder: '$6,054,560' },
      { id: 'other_structures', label: 'Other Structures', type: 'text', placeholder: '$430,521' },
      { id: 'personal_property', label: 'Personal Property', type: 'text', placeholder: '$2,511,372' },
      { id: 'loss_of_use', label: 'Loss of Use', type: 'text', placeholder: '$1,004,549' },
      { id: 'personal_liability', label: 'Personal Liability', type: 'text', placeholder: '$500,000' },
      { id: 'medical_payments', label: 'Medical Payments', type: 'text', placeholder: '$25,000' },
      { id: 'deductible_other', label: 'Deductible - Other Perils', type: 'text', placeholder: '$25,000' },
      { id: 'deductible_hurricane', label: 'Deductible - Hurricane', type: 'text', placeholder: '2% ($121,091)' },
      { id: 'deductible_wind', label: 'Deductible - Wind/Hail', type: 'text', placeholder: '1% ($34,732)' },
      { id: 'endorsements', label: 'Coverage Endorsements', type: 'textarea', placeholder: 'Roof Covering Full Reconstruction Cost\nService Line Coverage\nWater Backup Coverage' }
    ]
  },
  condo: {
    title: '🏢 Condo Insurance',
    fields: [
      { id: 'policy_number', label: 'Policy Number', type: 'text', placeholder: 'SHD00000893659' },
      { id: 'property_address', label: 'Condo Address', type: 'text', required: true, placeholder: '10851 Gulf Shore Dr Apt 1405' },
      { id: 'city_state_zip', label: 'City, State, ZIP', type: 'text', placeholder: 'Naples, FL 34108' },
      { id: 'policy_term', label: 'Policy Term', type: 'text', placeholder: '04/25/2025 to 04/25/2026' },
      { id: 'current_carrier', label: 'Current/Expiring Carrier', type: 'text' },
      { id: 'current_premium', label: 'Current/Expiring Annual Premium ($)', type: 'text', required: true, placeholder: '3200.00' },
      { id: 'proposed_carrier', label: 'Proposed/Renewal Carrier', type: 'text', required: true, placeholder: 'Evanston Insurance Company' },
      { id: 'proposed_premium', label: 'Proposed/Renewal Annual Premium ($)', type: 'text', required: true, placeholder: '3500.00' },
      { id: 'dwelling_coverage', label: 'Dwelling/Unit Coverage', type: 'text', placeholder: '$1,000,000' },
      { id: 'personal_property', label: 'Personal Property', type: 'text', placeholder: '$200,000' },
      { id: 'loss_of_use', label: 'Loss of Use', type: 'text', placeholder: 'No Coverage or Amount' },
      { id: 'personal_liability', label: 'Personal Liability', type: 'text', placeholder: '$500,000' },
      { id: 'medical_payments', label: 'Medical Payments', type: 'text', placeholder: '$10,000' },
      { id: 'deductible', label: 'Deductible - Other Perils', type: 'text', placeholder: '$5,000' },
      { id: 'loss_assessment', label: 'Loss Assessment Coverage', type: 'text', placeholder: '$5,000' },
      { id: 'endorsements', label: 'Coverage Endorsements', type: 'textarea', placeholder: 'Water Back-up: $5,000\nWater Damage Sublimit: $10,000\nMold Coverage: $5,000' }
    ]
  },
  wind: {
    title: '💨 Wind/Hurricane Coverage',
    fields: [
      { id: 'property_address', label: 'Property Address', type: 'text', required: true },
      { id: 'coverage_amount', label: 'Wind Coverage Amount', type: 'text', placeholder: 'e.g., $2,000,000' },
      { id: 'current_carrier', label: 'Current Carrier', type: 'text' },
      { id: 'current_premium', label: 'Current Annual Premium ($)', type: 'text', required: true, placeholder: '1500.00' },
      { id: 'proposed_carrier', label: 'Proposed Carrier', type: 'text', required: true },
      { id: 'proposed_premium', label: 'Proposed Annual Premium ($)', type: 'text', required: true, placeholder: '1650.00' },
      { id: 'deductible', label: 'Hurricane Deductible', type: 'text', placeholder: 'e.g., 2% of dwelling value' },
      { id: 'special_features', label: 'Coverage Details', type: 'textarea' }
    ]
  },
  auto: {
    title: '🚗 Auto Insurance',
    fields: [
      { id: 'policy_number', label: 'Policy Number', type: 'text', placeholder: 'PA228467105' },
      { id: 'policy_term', label: 'Policy Term', type: 'text', placeholder: '11/30/2025 to 11/30/2026' },
      { id: 'current_carrier', label: 'Current/Expiring Carrier', type: 'text' },
      { id: 'current_premium', label: 'Current/Expiring Annual Premium ($)', type: 'text', required: true, placeholder: '9397.12' },
      { id: 'proposed_carrier', label: 'Proposed/Renewal Carrier', type: 'text', required: true, placeholder: 'PURE Insurance' },
      { id: 'proposed_premium', label: 'Proposed/Renewal Annual Premium ($)', type: 'text', required: true, placeholder: '6621.00' },
      { id: 'vehicles', label: 'Vehicles Covered (separate each with line break)', type: 'textarea', placeholder: '2024 Maserati Grancabrio | VIN: ZAMBMXDB1RX446630 | Agreed Value: $244,497\n2023 Cadillac Escalade | VIN: 1GYS4RKL7PR512086 | Agreed Value: $88,790', required: true },
      { id: 'liability_limits', label: 'Combined Single Limit / Liability', type: 'text', placeholder: '$500,000' },
      { id: 'uninsured_motorist', label: 'Uninsured/Underinsured Motorist BI', type: 'text', placeholder: '$500,000' },
      { id: 'pip_coverage', label: 'Personal Injury Protection', type: 'text', placeholder: 'Basic' },
      { id: 'additional_pip', label: 'Additional PIP', type: 'text', placeholder: '$25,000' },
      { id: 'rental_reimbursement', label: 'Rental Reimbursement', type: 'text', placeholder: '$15,000' },
      { id: 'full_glass', label: 'Full Glass Coverage', type: 'text', placeholder: 'Yes' },
      { id: 'towing_labor', label: 'Towing & Labor', type: 'text', placeholder: '$250' },
      { id: 'comprehensive_deductible', label: 'Comprehensive Deductible', type: 'text', placeholder: '$2,500' },
      { id: 'collision_deductible', label: 'Collision Deductible', type: 'text', placeholder: '$2,500' },
      { id: 'drivers', label: 'Drivers Listed', type: 'textarea', placeholder: 'John Doe\nJane Doe' },
      { id: 'additional_interests', label: 'Additional Interests (Lien holders)', type: 'textarea', placeholder: 'Financial Services Vehicle Trust - 2023 BMW I7' }
    ]
  },
  umbrella: {
    title: '☂️ Umbrella/Excess Liability',
    fields: [
      { id: 'policy_number', label: 'Policy Number', type: 'text', placeholder: 'EX095673511' },
      { id: 'policy_term', label: 'Policy Term', type: 'text', placeholder: '11/01/2025 to 11/01/2026' },
      { id: 'current_carrier', label: 'Current/Expiring Carrier', type: 'text' },
      { id: 'current_premium', label: 'Current/Expiring Annual Premium ($)', type: 'text', required: true, placeholder: '2316.14' },
      { id: 'proposed_carrier', label: 'Proposed/Renewal Carrier', type: 'text', required: true, placeholder: 'PURE Insurance' },
      { id: 'proposed_premium', label: 'Proposed/Renewal Annual Premium ($)', type: 'text', required: true, placeholder: '2009.00' },
      { id: 'coverage_amount', label: 'Personal Excess Liability Limit', type: 'text', placeholder: '$10,000,000', required: true },
      { id: 'uninsured_motorist', label: 'Uninsured/Underinsured Motorist', type: 'text', placeholder: '$1,000,000' },
      { id: 'underlying_requirements', label: 'Underlying Policy Requirements', type: 'textarea', placeholder: 'Auto liability: $500,000\nHome liability: $500,000' }
    ]
  },
  watercraft: {
    title: '⛵ Watercraft Insurance',
    fields: [
      { id: 'policy_number', label: 'Policy Number', type: 'text', placeholder: 'PW095679511' },
      { id: 'policy_term', label: 'Policy Term', type: 'text', placeholder: '11/01/2025 to 11/01/2026' },
      { id: 'current_carrier', label: 'Current/Expiring Carrier', type: 'text' },
      { id: 'current_premium', label: 'Current/Expiring Annual Premium ($)', type: 'text', required: true, placeholder: '2309.00' },
      { id: 'proposed_carrier', label: 'Proposed/Renewal Carrier', type: 'text', required: true, placeholder: 'PURE Insurance' },
      { id: 'proposed_premium', label: 'Proposed/Renewal Annual Premium ($)', type: 'text', required: true, placeholder: '2419.00' },
      { id: 'vessels', label: 'Watercraft Details (one per line)', type: 'textarea', placeholder: '2021 Chris Craft Launch 25 | Hull ID: CCBMG157G021 | Hull Value: $206,808\n2003 Four Winns Funship | Hull ID: PENDING | Hull Value: $67,724', required: true },
      { id: 'liability', label: 'Liability', type: 'text', placeholder: '$500,000' },
      { id: 'uninsured_boaters', label: 'Uninsured Boaters', type: 'text', placeholder: '$500,000' },
      { id: 'medical_payments', label: 'Medical Payments', type: 'text', placeholder: '$10,000' },
      { id: 'personal_effects', label: 'Personal Effects', type: 'text', placeholder: '$25,000 ($250 deductible)' },
      { id: 'trailer_coverage', label: 'Trailer Coverage', type: 'text', placeholder: '$7,895 ($250 deductible)' },
      { id: 'emergency_towing', label: 'Emergency Towing & Assistance', type: 'text', placeholder: '$5,000' },
      { id: 'search_rescue', label: 'Search & Rescue Services', type: 'text', placeholder: '$25,000' },
      { id: 'deductible', label: 'Deductible', type: 'text', placeholder: '$2,068' },
      { id: 'operators', label: 'Operators Listed', type: 'textarea', placeholder: 'John Doe\nJane Doe' }
    ]
  },
  jewelry: {
    title: '💎 Jewelry & Valuables',
    fields: [
      { id: 'policy_number', label: 'Policy Number', type: 'text', placeholder: 'CO095677511' },
      { id: 'policy_term', label: 'Policy Term', type: 'text', placeholder: '11/01/2025 to 11/01/2026' },
      { id: 'current_carrier', label: 'Current/Expiring Carrier', type: 'text' },
      { id: 'current_premium', label: 'Current/Expiring Annual Premium ($)', type: 'text', required: true, placeholder: '1434.00' },
      { id: 'proposed_carrier', label: 'Proposed/Renewal Carrier', type: 'text', required: true, placeholder: 'PURE Insurance' },
      { id: 'proposed_premium', label: 'Proposed/Renewal Annual Premium ($)', type: 'text', required: true, placeholder: '1505.00' },
      { id: 'property_class', label: 'Property Class', type: 'text', placeholder: 'Jewelry, Furs, Cameras, etc.' },
      { id: 'total_limit', label: 'Total Limit', type: 'text', placeholder: '$176,165', required: true },
      { id: 'scheduled_items', label: 'Scheduled Property Details (one per line)', type: 'textarea', placeholder: 'Item 1: One ladies platinum & diamond engagement ring by A. Jaffe, 4.15ct round brilliant cut diamond, VS2, G - Value: $176,165', required: true }
    ]
  },
  cyber: {
    title: '🔒 Cyber Insurance',
    fields: [
      { id: 'coverage_amount', label: 'Coverage Limit', type: 'text', placeholder: 'e.g., $1,000,000', required: true },
      { id: 'current_carrier', label: 'Current Carrier', type: 'text' },
      { id: 'current_premium', label: 'Current Annual Premium ($)', type: 'text', required: true, placeholder: '2500.00' },
      { id: 'proposed_carrier', label: 'Proposed Carrier', type: 'text', required: true },
      { id: 'proposed_premium', label: 'Proposed Annual Premium ($)', type: 'text', required: true, placeholder: '2750.00' },
      { id: 'coverage_includes', label: 'Coverage Includes', type: 'textarea', placeholder: 'e.g., Identity theft, cyber extortion, data breach response' },
      { id: 'special_features', label: 'Additional Features', type: 'textarea' }
    ]
  },
  fineart: {
    title: '🎨 Fine Arts Insurance',
    fields: [
      { id: 'items_covered', label: 'Artwork & Collectibles', type: 'textarea', placeholder: 'List items with appraised values', required: true },
      { id: 'total_value', label: 'Total Scheduled Value', type: 'text', placeholder: 'e.g., $500,000' },
      { id: 'current_carrier', label: 'Current Carrier', type: 'text' },
      { id: 'current_premium', label: 'Current Annual Premium ($)', type: 'text', required: true, placeholder: '3500.00' },
      { id: 'proposed_carrier', label: 'Proposed Carrier', type: 'text', required: true },
      { id: 'proposed_premium', label: 'Proposed Annual Premium ($)', type: 'text', required: true, placeholder: '3250.00' },
      { id: 'special_features', label: 'Coverage Details', type: 'textarea', placeholder: 'e.g., Transit coverage, restoration costs, appreciation' }
    ]
  },
  other: {
    title: '📄 Other Coverage',
    fields: [
      { id: 'coverage_type', label: 'Coverage Type', type: 'text', placeholder: 'e.g., RV, Motorcycle, Business', required: true },
      { id: 'coverage_details', label: 'Coverage Details', type: 'textarea', placeholder: 'Describe the coverage', required: true },
      { id: 'current_carrier', label: 'Current Carrier', type: 'text' },
      { id: 'current_premium', label: 'Current Annual Premium ($)', type: 'text', required: true, placeholder: '1000.00' },
      { id: 'proposed_carrier', label: 'Proposed Carrier', type: 'text', required: true },
      { id: 'proposed_premium', label: 'Proposed Annual Premium ($)', type: 'text', required: true, placeholder: '950.00' },
      { id: 'special_features', label: 'Coverage Highlights', type: 'textarea' }
    ]
  }
};
