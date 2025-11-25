import { ProposalData, Coverage } from '@/types';

export const sampleProposalData: ProposalData = {
  proposalDate: new Date().toISOString().split('T')[0],

  agencyName: 'Metro Point Insurance',

  agentInfo: {
    name: 'Sarah Thompson',
    title: 'Producing Agent',
    phone: '(239) 555-0123',
    email: 'sarah.thompson@metropointins.com',
    address: '123 Insurance Plaza, Suite 500, Naples, FL 34102',
    website: 'www.metropointins.com'
  },

  teamMembers: [
    {
      name: 'Michael Rodriguez',
      title: 'Client Service Representative',
      phone: '(239) 555-0124',
      email: 'michael.rodriguez@metropointins.com'
    },
    {
      name: 'Jennifer Collins',
      title: 'Sales Manager',
      phone: '(239) 555-0125',
      email: 'jennifer.collins@metropointins.com'
    }
  ],

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
    } as Coverage,

    condo: {
      policy_number: 'CO445566789',
      property_address: '11125 Gulf Shore Drive, Unit 902',
      city_state_zip: 'Naples, FL 34108',
      policy_term: '03/15/2025 to 03/15/2026',
      current_carrier: 'State Farm',
      current_premium: '3200.00',
      proposed_carrier: 'Chubb Insurance',
      proposed_premium: '2890.00',
      dwelling_coverage: '$850,000',
      personal_property: '$425,000',
      loss_of_use: '$170,000',
      personal_liability: '$500,000',
      medical_payments: '$10,000',
      deductible: '$10,000',
      loss_assessment: '$50,000',
      endorsements: 'Water Back-up Coverage: $25,000\nMold Coverage: $10,000\nRefrigerated Products: $2,500\nBuilding Ordinance or Law: 25%'
    } as Coverage,

    wind: {
      property_address: '8945 Gulf Shore Drive',
      coverage_amount: '$8,500,000',
      current_carrier: 'Citizens Property Insurance',
      current_premium: '18500.00',
      proposed_carrier: 'Frontline Insurance',
      proposed_premium: '16750.00',
      deductible: '2% of dwelling value ($170,000)',
      special_features: 'Named Storm Coverage\nHurricane Deductible Buyback Option Available\nWind-Driven Rain Coverage Included\nTemporary Living Expenses: 12 months\nDebris Removal: Full Coverage'
    } as Coverage,

    jewelry: {
      policy_number: 'JW123456789',
      policy_term: '01/01/2025 to 01/01/2026',
      current_carrier: 'Jewelers Mutual',
      current_premium: '2850.00',
      proposed_carrier: 'Chubb Personal Articles',
      proposed_premium: '2650.00',
      property_class: 'Jewelry, Watches, Furs',
      total_limit: '$485,000',
      scheduled_items: 'Ladies 5.2ct Diamond Engagement Ring - Tiffany & Co. - $245,000\nRolex Daytona Platinum Watch (2022) - $125,000\nCartier Love Bracelet Collection (4 pieces) - $65,000\nDiamond Necklace - Harry Winston - $50,000'
    } as Coverage,

    cyber: {
      coverage_amount: '$1,000,000',
      current_carrier: 'Coalition Insurance',
      current_premium: '1250.00',
      proposed_carrier: 'AIG Cyber Edge',
      proposed_premium: '1450.00',
      coverage_includes: 'Identity Theft Restoration Services\nCyber Extortion Coverage\nData Breach Response\nFraud Loss Reimbursement up to $50,000\nLegal & Forensic Expert Fees\nCredit Monitoring Services (3 years)\nSocial Media Account Hijacking\nRansomware Attack Response',
      special_features: '24/7 Breach Response Hotline\nPre-breach Security Assessment\nOnline Privacy Protection\nReputation Management Services'
    } as Coverage,

    fineart: {
      items_covered: 'Andy Warhol Silkscreen Print "Marilyn Monroe" (1967) - $185,000\nPicasso Lithograph "Le Dejeuner sur l\'herbe" - $125,000\nDale Chihuly Glass Sculpture - $45,000\nRobert Rauschenberg Mixed Media - $75,000\nYayoi Kusama Pumpkin Sculpture - $95,000\nVintage Rolex Collection (10 pieces) - $275,000',
      total_value: '$800,000',
      current_carrier: 'AXA Art Insurance',
      current_premium: '4200.00',
      proposed_carrier: 'Chubb Masterpiece',
      proposed_premium: '3950.00',
      special_features: 'Worldwide Transit Coverage\nPair & Set Coverage\nAppreciation in Value Protection (up to 150%)\nRestoration Costs Covered\nMuseum-Quality Storage Coverage\nProfessional Appraisal Services Included\nNo Deductible on Scheduled Items'
    } as Coverage,

    other: {
      coverage_type: 'Recreational Vehicles & Toys',
      coverage_details: '2023 Prevost Motor Coach H3-45 VIP - $2,500,000\n2024 Can-Am Spyder RT Limited - $35,000\n2023 Harley-Davidson CVO Road Glide - $55,000\nVintage Car Collection Storage Unit Contents',
      current_carrier: 'Progressive',
      current_premium: '8500.00',
      proposed_carrier: 'Safeco Elite RV',
      proposed_premium: '7890.00',
      special_features: 'Full Replacement Cost on Motor Coach\nRoadside Assistance & Towing\nPersonal Effects Coverage: $75,000\nVacation Liability Coverage\nEmergency Expense Coverage\nCustom Parts & Equipment Coverage'
    } as Coverage
  },

  executiveSummary: `Dear Mr. and Mrs. Henderson,

Thank you for the opportunity to present this comprehensive WRAP (Wealth Risk Analysis & Protection) proposal for your insurance portfolio. After carefully reviewing your current coverage and conducting a thorough market analysis, I am pleased to present significant enhancements to your protection while generating substantial premium savings.

Key Highlights of This Proposal:

• Total Annual Savings: $12,280 (15.8% reduction)
• Enhanced coverage limits across all 10 policy lines
• Streamlined account management with PURE and Chubb as primary carriers
• Superior claims service and high-net-worth expertise
• Additional coverages included at no extra cost
• Comprehensive protection for all your valuable assets

This proposal represents a complete review of your entire insurance portfolio including:
- Primary Residence (Homeowners)
- Investment Property (Condo)
- Wind/Hurricane Coverage
- Personal Auto (3 vehicles)
- Excess Liability (Umbrella)
- Watercraft (2 vessels)
- Scheduled Jewelry & Watches
- Cyber & Identity Theft Protection
- Fine Art & Collectibles
- Recreational Vehicles & Toys

We have carefully structured these policies to eliminate gaps in coverage while ensuring you have the proper protection for your significant assets valued at over $15 million.

I look forward to discussing this proposal with you and addressing any questions you may have.`,

  notes: `Important Notes:

1. All quoted premiums are annual and assume continuous coverage with no lapse.
2. Final premiums subject to underwriting review and acceptance by each carrier.
3. Current carrier information based on declarations pages provided.
4. Recommended effective date: Match current policy renewal dates for seamless transition.
5. All values, coverage limits, and scheduled items are subject to appraisal and acceptance by the proposed carriers.
6. Wind coverage may require separate windstorm mitigation inspection.
7. Fine art and jewelry items require current appraisals (within 24 months).
8. Cyber coverage includes complimentary dark web monitoring and breach response services.
9. Watercraft coverage includes navigational limits - review with underwriter.
10. Motor coach and recreational vehicle coverage subject to vehicle inspection.

Coverage Coordination:
• PURE Insurance will serve as primary carrier for Home, Auto, Umbrella, and Watercraft
• Chubb will provide Condo, Jewelry, and Fine Art coverage
• Specialty carriers for Wind, Cyber, and Recreational Vehicle coverage
• All policies coordinated to ensure proper underlying limits for umbrella

Next Steps:
• Review and approve this comprehensive proposal
• Complete insurance applications for each coverage line
• Schedule property inspections (primary residence and investment property)
• Provide updated appraisals for fine art and jewelry items
• Schedule watercraft and motor coach inspections
• Coordinate policy binding and cancellation of existing policies
• Set up consolidated billing for streamlined payment management

Please contact me with any questions or to move forward with this proposal. Our team is available to assist you throughout the entire transition process.`
};
