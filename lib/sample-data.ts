import { ProposalData, Coverage } from '@/types';

export const sampleProposalData: ProposalData = {
  proposalDate: new Date().toISOString().split('T')[0],

  agencyName: 'Metro Point Insurance',

  agentInfo: {
    name: 'Sarah Thompson',
    phone: '(239) 555-0123',
    email: 'sarah.thompson@metropoint.com'
  },

  clientInfo: {
    firstName: 'Robert',
    lastName: 'Henderson',
    address: '8945 Gulf Shore Drive',
    city: 'Naples',
    state: 'FL',
    zip: '34108',
    email: 'robert.henderson@email.com',
    phone: '(239) 555-7890'
  },

  coverages: {
    homeowners: {
      policy_number: 'HO987654321',
      property_address: '8945 Gulf Shore Drive',
      city_state_zip: 'Naples, FL 34108',
      policy_term: '01/01/2025 to 01/01/2026',
      current_carrier: 'State Farm',
      current_premium: '12500.00',
      proposed_carrier: 'PURE Insurance',
      proposed_premium: '10850.00',
      dwelling_coverage: '$8,500,000',
      other_structures: '$850,000',
      personal_property: '$3,400,000',
      loss_of_use: '$1,700,000',
      personal_liability: '$500,000',
      medical_payments: '$25,000',
      deductible_other: '$25,000',
      deductible_hurricane: '2% ($170,000)',
      deductible_wind: '1% ($85,000)',
      endorsements: 'Guaranteed Replacement Cost\nService Line Coverage: $50,000\nWater Backup: $25,000\nIdentity Theft: $25,000\nEquipment Breakdown'
    } as Coverage,

    auto: {
      policy_number: 'PA445566778',
      policy_term: '11/30/2025 to 11/30/2026',
      current_carrier: 'Progressive',
      current_premium: '8750.00',
      proposed_carrier: 'PURE Insurance',
      proposed_premium: '6990.00',
      vehicles: '2024 Porsche 911 Turbo S | VIN: WP0AB2A99PS123456 | Agreed Value: $245,000\n2023 Range Rover Sport | VIN: SALWR2FV9PA123789 | Agreed Value: $95,000\n2022 Tesla Model X Plaid | VIN: 5YJXCAE24MF123456 | Agreed Value: $110,000',
      liability_limits: '$500,000',
      uninsured_motorist: '$500,000',
      pip_coverage: 'Basic',
      additional_pip: '$25,000',
      rental_reimbursement: '$15,000',
      full_glass: 'Yes',
      towing_labor: '$250',
      comprehensive_deductible: '$2,500',
      collision_deductible: '$2,500',
      drivers: 'Robert Henderson (Primary)\nElizabeth Henderson (Listed)',
      additional_interests: 'Chase Auto Finance - 2024 Porsche 911 Turbo S'
    } as Coverage,

    umbrella: {
      policy_number: 'EX123456789',
      policy_term: '01/01/2025 to 01/01/2026',
      current_carrier: 'Travelers',
      current_premium: '3250.00',
      proposed_carrier: 'PURE Insurance',
      proposed_premium: '2890.00',
      coverage_amount: '$10,000,000',
      uninsured_motorist: '$1,000,000',
      underlying_requirements: 'Auto Liability: $500,000 Combined Single Limit\nHomeowners Liability: $500,000\nWatercraft Liability: $500,000'
    } as Coverage,

    watercraft: {
      policy_number: 'PW789012345',
      policy_term: '01/01/2025 to 01/01/2026',
      current_carrier: 'Progressive Marine',
      current_premium: '4500.00',
      proposed_carrier: 'PURE Insurance',
      proposed_premium: '3850.00',
      vessels: '2022 Sea Ray SLX 400 | Hull ID: SER12345G122 | Hull Value: $625,000\n2020 Boston Whaler 270 Vantage | Hull ID: BWC98765A120 | Hull Value: $185,000',
      liability: '$500,000',
      uninsured_boaters: '$500,000',
      medical_payments: '$10,000',
      personal_effects: '$50,000 ($500 deductible)',
      trailer_coverage: '$15,000 ($250 deductible)',
      emergency_towing: '$10,000',
      search_rescue: '$50,000',
      deductible: '$5,000',
      operators: 'Robert Henderson\nElizabeth Henderson\nJames Henderson (Son, Age 25)'
    } as Coverage
  },

  executiveSummary: `Dear Mr. and Mrs. Henderson,

Thank you for the opportunity to present this comprehensive WRAP (Wealth Risk Analysis & Protection) proposal for your insurance portfolio. After carefully reviewing your current coverage and conducting a thorough market analysis, I am pleased to present significant enhancements to your protection while generating substantial premium savings.

Key Highlights of This Proposal:

• Total Annual Savings: $7,770 (24.7% reduction)
• Enhanced coverage limits across all policies
• Streamlined account management with PURE Insurance as primary carrier
• Superior claims service and high-net-worth expertise
• Additional coverages included at no extra cost

This proposal represents a comprehensive review of your Homeowners, Auto, Umbrella, and Watercraft insurance needs. We have carefully structured these policies to eliminate gaps in coverage while ensuring you have the proper protection for your significant assets.

I look forward to discussing this proposal with you and addressing any questions you may have.`,

  notes: `Important Notes:

1. All quoted premiums are annual and assume continuous coverage with no lapse.
2. Final premiums subject to underwriting review and acceptance.
3. Current carrier information based on declarations pages provided.
4. Recommended effective date: Match current policy renewal dates for seamless transition.
5. All values and coverage limits are subject to appraisal and acceptance by the proposed carrier.

Next Steps:
• Review and approve this proposal
• Complete insurance applications
• Schedule property inspections (if required)
• Coordinate policy binding and cancellation of existing policies

Please contact me with any questions or to move forward with this proposal.`
};
