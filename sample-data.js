// Sample data for testing - based on Dewolf/Christensen Group sample
const sampleData = {
    companyInfo: {
        name: 'ABC Insurance Agency',
        phone: '(555) 123-4567',
        email: 'info@abcinsurance.com',
        address: '123 Main Street, Suite 100, Your City, ST 12345',
        website: 'www.abcinsurance.com',
        logo: '',
        brandColor: '#003366'
    },
    teamMembers: [
        {
            name: 'John Smith',
            title: 'Senior Vice President, Private Client Services',
            phone: '(555) 123-4567',
            email: 'jsmith@abcinsurance.com',
            photo: ''
        },
        {
            name: 'Jane Doe',
            title: 'Senior Advisor',
            phone: '(555) 123-4568',
            email: 'jdoe@abcinsurance.com',
            photo: ''
        },
        {
            name: 'Robert Johnson',
            title: 'Claims Specialist',
            phone: '(555) 123-4569',
            email: 'rjohnson@abcinsurance.com',
            photo: ''
        }
    ],
    proposalDate: new Date().toISOString().split('T')[0],
    clientInfo: {
        firstName: 'Brian',
        lastName: 'Dewolf',
        address: '2922 Indigobush Way',
        city: 'Naples',
        state: 'FL',
        zip: '34105',
        email: 'brian.dewolf@email.com',
        phone: '(239) 555-0101'
    },
    coverages: {
        homeowners: {
            policy_number: 'HO228218305',
            property_address: '2922 Indigobush Way',
            city_state_zip: 'Naples, FL 34105',
            policy_term: '11/13/2025 to 11/13/2026',
            current_carrier: 'State Farm',
            current_premium: '30578',
            proposed_carrier: 'PURE Insurance',
            proposed_premium: '33743.07',
            dwelling_coverage: '$6,054,560',
            other_structures: '$430,521',
            personal_property: '$2,511,372',
            loss_of_use: '$1,004,549',
            personal_liability: '$500,000',
            medical_payments: '$25,000',
            deductible_other: '$25,000',
            deductible_hurricane: '2% ($121,091)',
            deductible_wind: '',
            endorsements: 'Extended Replacement Cost - Guaranteed\nService Line Coverage - Included\nWater Backup Coverage - $50,000\nEquipment Breakdown - Included\nIdentity Theft - $25,000'
        },
        condo: {
            policy_number: 'SHD00000893659',
            property_address: '10851 Gulf Shore Dr Apt 1405',
            city_state_zip: 'Naples, FL 34108',
            policy_term: '04/25/2025 to 04/25/2026',
            current_carrier: 'Allstate',
            current_premium: '3200',
            proposed_carrier: 'Evanston Insurance Company',
            proposed_premium: '3675.95',
            dwelling_coverage: '$1,000,000',
            personal_property: '$200,000',
            loss_of_use: 'No Coverage',
            personal_liability: '$500,000',
            medical_payments: '$10,000',
            deductible: '$5,000',
            loss_assessment: '$5,000',
            endorsements: 'Water Back-up: $5,000\nWater Damage Sublimit: $10,000\nMold Coverage: $5,000\nLoss Assessment: $5,000'
        },
        auto: {
            policy_number: 'PA228467105',
            policy_term: '11/30/2025 to 11/30/2026',
            current_carrier: 'Progressive',
            current_premium: '9397.12',
            proposed_carrier: 'PURE Insurance',
            proposed_premium: '6621',
            vehicles: '2024 Maserati Grancabrio | VIN: ZAMBMXDB1RX446630 | Agreed Value: $244,497\n2023 Cadillac Escalade | VIN: 1GYS4RKL7PR512086 | Agreed Value: $88,790\n2023 BMW I7 | VIN: WBY53EJ0XPCN36146 | Agreed Value: $78,060\n2021 Club Car Golf Cart | VIN: FLA112469 | Agreed Value: $13,559',
            liability_limits: '$500,000',
            uninsured_motorist: '$500,000',
            pip_coverage: 'Basic PIP',
            additional_pip: '$25,000',
            rental_reimbursement: '$15,000',
            full_glass: 'Yes',
            towing_labor: '$250',
            comprehensive_deductible: '$2,500',
            collision_deductible: '$2,500',
            drivers: 'Brian R. Dewolf\nRenee M. Dewolf',
            additional_interests: 'Financial Services Vehicle Trust - 2023 BMW I7 (Loss Payee)'
        },
        watercraft: {
            policy_number: 'PW095679511',
            policy_term: '11/01/2025 to 11/01/2026',
            current_carrier: 'BoatUS',
            current_premium: '2309',
            proposed_carrier: 'PURE Insurance',
            proposed_premium: '2419',
            vessels: '2021 Chris Craft Launch 25 | Hull ID: CCBMG157G021 | Hull Value: $206,808\n2003 Four Winns Funship | Hull ID: PENDING | Hull Value: $67,724',
            liability: '$500,000',
            uninsured_boaters: '$500,000',
            medical_payments: '$10,000',
            personal_effects: '$25,000 ($250 deductible)',
            trailer_coverage: '$7,895 ($250 deductible)',
            emergency_towing: '$5,000',
            search_rescue: '$25,000',
            deductible: '$2,068',
            operators: 'Brian R. Dewolf\nRenee M. Dewolf'
        },
        jewelry: {
            policy_number: 'CO095677511',
            policy_term: '11/01/2025 to 11/01/2026',
            current_carrier: 'State Farm Personal Articles',
            current_premium: '1434',
            proposed_carrier: 'PURE Insurance',
            proposed_premium: '1505',
            property_class: 'Jewelry',
            total_limit: '$176,165',
            scheduled_items: 'Item 1: One ladies platinum & diamond engagement ring by A. Jaffe, 4.15ct round brilliant cut diamond in center, VS2, G color - Value: $176,165'
        },
        umbrella: {
            policy_number: 'EX095673511',
            policy_term: '11/01/2025 to 11/01/2026',
            current_carrier: 'State Farm',
            current_premium: '2316.14',
            proposed_carrier: 'PURE Insurance',
            proposed_premium: '2009',
            coverage_amount: '$10,000,000',
            uninsured_motorist: '$1,000,000',
            underlying_requirements: 'Auto Liability: $500,000 Combined Single Limit\nHome Liability: $500,000 per occurrence\nWatercraft Liability: $500,000 per occurrence'
        },
        wind: {
            property_address: '2922 Indigobush Way',
            coverage_amount: '$6,054,560',
            current_carrier: 'Citizens Property Insurance',
            current_premium: '4250.50',
            proposed_carrier: 'Typhoon Insurance Company',
            proposed_premium: '3895.75',
            deductible: '5% ($302,728)',
            special_features: 'Hurricane Wind Coverage\nNamed Storm Coverage\nCatastrophic Wind Pool Participation'
        },
        cyber: {
            coverage_amount: '$1,000,000',
            current_carrier: 'Hartford Cyber Insurance',
            current_premium: '2850.00',
            proposed_carrier: 'Chubb Cyber Enterprise Risk',
            proposed_premium: '2675.00',
            coverage_includes: 'Identity Theft Recovery - $50,000\nCyber Extortion - $250,000\nData Breach Response - $500,000\nBusiness Interruption - Included\nReputation Management - Included',
            special_features: '24/7 Incident Response Hotline\nForensic Investigation Services\nCredit Monitoring for Family Members\nLegal Defense Costs'
        },
        fineart: {
            items_covered: 'Picasso - "Blue Period" Original Sketch - $285,000\nMonet - "Water Lilies" Limited Edition Print - $45,000\nWarhol - "Campbell\'s Soup" Signed Lithograph - $125,000\nAntique Persian Rug Collection (3 pieces) - $95,000\nMing Dynasty Vase - $150,000',
            total_value: '$700,000',
            current_carrier: 'AIG Private Client Fine Arts',
            current_premium: '4200.00',
            proposed_carrier: 'Chubb Masterpiece Fine Arts',
            proposed_premium: '3850.00',
            special_features: 'Worldwide Coverage - Including Transit\nPair & Set Coverage\nRestoration Cost Coverage\nAppreciation Coverage - 125% of Scheduled Value\nMuseum Exhibition Coverage\nProfessional Restoration Services Network'
        }
    },
    executiveSummary: 'We have conducted a comprehensive review of Brian and Renee\'s insurance portfolio and identified opportunities to consolidate coverage with PURE Insurance, providing superior coverage and streamlined claims service. This proposal demonstrates our commitment to protecting your significant assets across multiple properties, vehicles, and watercraft while maintaining competitive pricing.\n\nKey Highlights:\n- Consolidation of home, auto, watercraft, jewelry, and umbrella policies with PURE Insurance\n- Enhanced coverage limits reflecting current property values\n- Superior claims service and concierge support for high net worth clients\n- Competitive pricing with comprehensive protection',
    notes: 'Recommendations & Discussion Points:\n\n• Consider increasing FL home deductible to $50,000 for annual savings of $1,007.98\n\n• Excellent umbrella coverage at $10M provides comprehensive liability protection for your asset portfolio\n\n• All primary policies consolidated with PURE Insurance for seamless claims service and account management\n\n• Annual insurance review scheduled for Q4 2026 to ensure coverage keeps pace with asset values\n\n• PURE membership includes complimentary home inspections and risk management consultation\n\n• Consider flood insurance for Naples properties given coastal location - separate quote available upon request\n\n• Jewelry appraisal current as of 2024 - recommend re-appraisal every 3-5 years\n\n• Golf cart coverage included in auto policy with agreed value coverage\n\nPlease contact us with any questions or to discuss these recommendations further.'
};

// Function to load sample data into the form
function loadSampleData() {
    if (confirm('Load sample data? This will replace any current form data.')) {
        populateFormData(sampleData);
        showMessage('Sample data loaded successfully! All coverage types are filled in.', 'success');
    }
}
