'use client';

import { useState } from 'react';
import { ProposalData, CoverageType, AgentInfo, ClientInfo, Coverage, UploadedFiles } from '@/types';
import { coverageTemplates } from '@/lib/coverage-templates';
import { sampleProposalData } from '@/lib/sample-data';
import FileUpload from '@/components/FileUpload';

export default function ProposalGenerator() {
  const [agentInfo, setAgentInfo] = useState<AgentInfo>({
    name: '',
    phone: '',
    email: 'sarah.thompson@abcinsurance.com',
    title: '',
    photo: ''
  });

  const [teamMembers, setTeamMembers] = useState<AgentInfo[]>([
    { name: '', phone: '', email: '', title: '', photo: '' },
    { name: '', phone: '', email: '', title: '', photo: '' },
    { name: '', phone: '', email: '', title: '', photo: '' }
  ]);

  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    email: '',
    phone: ''
  });

  const [proposalDate, setProposalDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCoverages, setSelectedCoverages] = useState<Set<CoverageType>>(new Set());
  const [coverageData, setCoverageData] = useState<Record<CoverageType, Coverage>>({} as Record<CoverageType, Coverage>);
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string>('');

  // New state for agency branding
  const [agencyLogo, setAgencyLogo] = useState<string>('');
  const [agencyName, setAgencyName] = useState<string>('ABC Insurance Agency');
  const [agentPhoto, setAgentPhoto] = useState<string>('');

  // New state for file uploads
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({
    currentDecPages: [],
    newProposals: []
  });

  // State for agent sections expansion
  const [showAgent2, setShowAgent2] = useState(false);
  const [showAgent3, setShowAgent3] = useState(false);
  const [showAgent4, setShowAgent4] = useState(false);

  const coverageTypes: { key: CoverageType; label: string }[] = [
    { key: 'homeowners', label: 'Homeowners Insurance' },
    { key: 'condo', label: 'Condo Insurance' },
    { key: 'wind', label: 'Wind/Hurricane Coverage' },
    { key: 'auto', label: 'Auto Insurance' },
    { key: 'umbrella', label: 'Umbrella/Excess Liability' },
    { key: 'watercraft', label: 'Watercraft Insurance' },
    { key: 'jewelry', label: 'Jewelry & Valuables' },
    { key: 'cyber', label: 'Cyber Insurance' },
    { key: 'fineart', label: 'Fine Arts Insurance' },
    { key: 'other', label: 'Other Coverage' }
  ];

  const handleLoadSampleData = () => {
    // Load all sample data
    setAgencyName(sampleProposalData.agencyName || '');
    setAgentInfo(sampleProposalData.agentInfo);

    // Load team members
    if (sampleProposalData.teamMembers && sampleProposalData.teamMembers.length > 0) {
      setTeamMembers(sampleProposalData.teamMembers);
      if (sampleProposalData.teamMembers.length > 0) setShowAgent2(true);
      if (sampleProposalData.teamMembers.length > 1) setShowAgent3(true);
      if (sampleProposalData.teamMembers.length > 2) setShowAgent4(true);
    }

    setClientInfo(sampleProposalData.clientInfo);
    setProposalDate(sampleProposalData.proposalDate);
    setExecutiveSummary(sampleProposalData.executiveSummary || '');
    setNotes(sampleProposalData.notes || '');

    // Load coverages
    const coverageKeys = Object.keys(sampleProposalData.coverages) as CoverageType[];
    setSelectedCoverages(new Set(coverageKeys));
    setCoverageData(sampleProposalData.coverages as Record<CoverageType, Coverage>);
  };

  const handleCoverageToggle = (coverageType: CoverageType) => {
    const newSelected = new Set(selectedCoverages);
    if (newSelected.has(coverageType)) {
      newSelected.delete(coverageType);
      const newCoverageData = { ...coverageData };
      delete newCoverageData[coverageType];
      setCoverageData(newCoverageData);
    } else {
      newSelected.add(coverageType);
      // Initialize coverage data with empty values
      const template = coverageTemplates[coverageType];
      const initialData: Coverage = {
        current_premium: '',
        proposed_premium: '',
        proposed_carrier: ''
      };
      template.fields.forEach(field => {
        initialData[field.id] = '';
      });
      setCoverageData({ ...coverageData, [coverageType]: initialData });
    }
    setSelectedCoverages(newSelected);
  };

  const handleCoverageFieldChange = (coverageType: CoverageType, fieldId: string, value: string) => {
    setCoverageData({
      ...coverageData,
      [coverageType]: {
        ...coverageData[coverageType],
        [fieldId]: value
      }
    });
  };

  const handleExtractData = async () => {
    setIsExtracting(true);
    setExtractionError('');

    try {
      const currentDecUrls = uploadedFiles.currentDecPages.map(url => ({ url, type: 'current' }));
      const proposedUrls = uploadedFiles.newProposals.map(url => ({ url, type: 'proposed' }));
      const allPdfFiles = [...currentDecUrls, ...proposedUrls];

      if (allPdfFiles.length === 0) {
        setExtractionError('No PDFs uploaded. Please upload policy documents first.');
        return;
      }

      const response = await fetch('/api/extract-pdf-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pdfFiles: allPdfFiles })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract data');
      }

      const { data } = await response.json();

      // Populate client info if extracted
      if (data.clientInfo) {
        setClientInfo({
          ...clientInfo,
          ...Object.fromEntries(
            Object.entries(data.clientInfo).filter(([_, v]) => v !== '')
          )
        });
      }

      // Populate coverages if extracted
      if (data.coverages && Array.isArray(data.coverages)) {
        const newCoverageData = { ...coverageData };
        const newSelectedCoverages = new Set(selectedCoverages);

        data.coverages.forEach((coverage: any) => {
          if (coverage.type) {
            const coverageType = coverage.type as CoverageType;
            newSelectedCoverages.add(coverageType);

            // Merge with existing coverage data
            const filteredCoverage = Object.fromEntries(
              Object.entries(coverage).filter(([k, v]) => k !== 'type' && v !== '')
            ) as Partial<Coverage>;

            newCoverageData[coverageType] = {
              ...newCoverageData[coverageType],
              ...filteredCoverage
            } as Coverage;
          }
        });

        setSelectedCoverages(newSelectedCoverages);
        setCoverageData(newCoverageData);
      }

      alert('Data extracted successfully! Form fields have been populated.');
    } catch (error) {
      console.error('Error extracting data:', error);
      setExtractionError(error instanceof Error ? error.message : 'Failed to extract data');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerateWord = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      // Filter out empty team members
      const filteredTeamMembers = teamMembers.filter(member =>
        member.name.trim() !== '' ||
        (member.email && member.email.trim() !== '') ||
        (member.phone && member.phone.trim() !== '')
      );

      const proposalData: ProposalData = {
        proposalDate,
        agentInfo,
        teamMembers: filteredTeamMembers.length > 0 ? filteredTeamMembers : undefined,
        clientInfo,
        coverages: coverageData,
        executiveSummary,
        notes,
        agencyLogo,
        agencyName,
        agentPhoto,
        uploadedFiles
      };

      const response = await fetch('/api/generate-word', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(proposalData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate Word document');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `WRAP_Proposal_${clientInfo.lastName}_${proposalDate}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating Word document:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to generate Word document'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      // Filter out empty team members
      const filteredTeamMembers = teamMembers.filter(member =>
        member.name.trim() !== '' ||
        (member.email && member.email.trim() !== '') ||
        (member.phone && member.phone.trim() !== '')
      );

      const proposalData: ProposalData = {
        proposalDate,
        agentInfo,
        teamMembers: filteredTeamMembers.length > 0 ? filteredTeamMembers : undefined,
        clientInfo,
        coverages: coverageData,
        executiveSummary,
        notes,
        agencyLogo,
        agencyName,
        agentPhoto,
        uploadedFiles
      };

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(proposalData)
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `WRAP_Proposal_${clientInfo.lastName}_${proposalDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-8" style={{ backgroundColor: '#003B5C' }}>
            <h1 className="text-3xl font-bold text-white text-center">
              WRAP Proposal Generator
            </h1>
            <p className="mt-2 text-center text-gray-200">
              Create professional insurance proposals
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-8 space-y-8">
            {/* Load Sample Data Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleLoadSampleData}
                className="px-6 py-2 text-white font-semibold rounded-md shadow-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#D4AF37' }}
              >
                Load Sample Data
              </button>
            </div>

            {/* Agency Branding Section */}
            <section className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
              <h2 className="text-2xl font-semibold mb-4" style={{ color: '#003B5C' }}>
                Agency Branding
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FileUpload
                    label="Agency Logo"
                    accept="image/*"
                    fileType="image"
                    onFilesSelected={(files) => setAgencyLogo(files[0] || '')}
                    showPreview={true}
                    maxSizeMB={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agency Name
                  </label>
                  <input
                    type="text"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    placeholder="ABC Insurance Agency"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  />
                </div>
              </div>
            </section>

            {/* Agent Information */}
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: '#003B5C' }}>
                Your Team
              </h2>

              {/* Agent #1 (Primary - Always Shown) */}
              <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200 mb-4">
                <h3 className="text-xl font-semibold mb-4" style={{ color: '#003B5C' }}>
                  Agent #1 (Primary Agent) *
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={agentInfo.name}
                      onChange={(e) => setAgentInfo({ ...agentInfo, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={agentInfo.title}
                      onChange={(e) => setAgentInfo({ ...agentInfo, title: e.target.value })}
                      placeholder="e.g., Producing Agent"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={agentInfo.phone}
                      onChange={(e) => setAgentInfo({ ...agentInfo, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={agentInfo.email}
                      onChange={(e) => setAgentInfo({ ...agentInfo, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FileUpload
                      label="Agent Photo"
                      accept="image/*"
                      fileType="image"
                      onFilesSelected={(files) => setAgentInfo({ ...agentInfo, photo: files[0] || '' })}
                      showPreview={true}
                      maxSizeMB={5}
                    />
                  </div>
                </div>
              </div>

              {/* Agent #2 (Optional) */}
              <div className="mb-4">
                {!showAgent2 ? (
                  <button
                    type="button"
                    onClick={() => setShowAgent2(true)}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    + Add Agent #2 (Optional)
                  </button>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-300">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold" style={{ color: '#003B5C' }}>
                        Agent #2 (Optional)
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAgent2(false);
                          setTeamMembers([
                            { name: '', phone: '', email: '', title: '', photo: '' },
                            teamMembers[1]
                          ]);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={teamMembers[0]?.name || ''}
                          onChange={(e) => {
                            const newTeamMembers = [...teamMembers];
                            newTeamMembers[0] = { ...newTeamMembers[0], name: e.target.value };
                            setTeamMembers(newTeamMembers);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={teamMembers[0]?.title || ''}
                          onChange={(e) => {
                            const newTeamMembers = [...teamMembers];
                            newTeamMembers[0] = { ...newTeamMembers[0], title: e.target.value };
                            setTeamMembers(newTeamMembers);
                          }}
                          placeholder="e.g., Client Service Representative"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={teamMembers[0]?.phone || ''}
                          onChange={(e) => {
                            const newTeamMembers = [...teamMembers];
                            newTeamMembers[0] = { ...newTeamMembers[0], phone: e.target.value };
                            setTeamMembers(newTeamMembers);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={teamMembers[0]?.email || ''}
                          onChange={(e) => {
                            const newTeamMembers = [...teamMembers];
                            newTeamMembers[0] = { ...newTeamMembers[0], email: e.target.value };
                            setTeamMembers(newTeamMembers);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <FileUpload
                          label="Agent Photo"
                          accept="image/*"
                          fileType="image"
                          onFilesSelected={(files) => {
                            const newTeamMembers = [...teamMembers];
                            newTeamMembers[0] = { ...newTeamMembers[0], photo: files[0] || '' };
                            setTeamMembers(newTeamMembers);
                          }}
                          showPreview={true}
                          maxSizeMB={5}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Agent #3 (Optional) */}
              <div className="mb-4">
                {!showAgent3 ? (
                  <button
                    type="button"
                    onClick={() => setShowAgent3(true)}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    + Add Agent #3 (Optional)
                  </button>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-300">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold" style={{ color: '#003B5C' }}>
                        Agent #3 (Optional)
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAgent3(false);
                          const newTeamMembers = [...teamMembers];
                          newTeamMembers[1] = { name: '', phone: '', email: '', title: '', photo: '' };
                          setTeamMembers(newTeamMembers);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={teamMembers[1]?.name || ''}
                          onChange={(e) => {
                            const newTeamMembers = [...teamMembers];
                            newTeamMembers[1] = { ...newTeamMembers[1], name: e.target.value };
                            setTeamMembers(newTeamMembers);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={teamMembers[1]?.title || ''}
                          onChange={(e) => {
                            const newTeamMembers = [...teamMembers];
                            newTeamMembers[1] = { ...newTeamMembers[1], title: e.target.value };
                            setTeamMembers(newTeamMembers);
                          }}
                          placeholder="e.g., Sales Manager"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={teamMembers[1]?.phone || ''}
                          onChange={(e) => {
                            const newTeamMembers = [...teamMembers];
                            newTeamMembers[1] = { ...newTeamMembers[1], phone: e.target.value };
                            setTeamMembers(newTeamMembers);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={teamMembers[1]?.email || ''}
                          onChange={(e) => {
                            const newTeamMembers = [...teamMembers];
                            newTeamMembers[1] = { ...newTeamMembers[1], email: e.target.value };
                            setTeamMembers(newTeamMembers);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <FileUpload
                          label="Agent Photo"
                          accept="image/*"
                          fileType="image"
                          onFilesSelected={(files) => {
                            const newTeamMembers = [...teamMembers];
                            newTeamMembers[1] = { ...newTeamMembers[1], photo: files[0] || '' };
                            setTeamMembers(newTeamMembers);
                          }}
                          showPreview={true}
                          maxSizeMB={5}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Agent #4 (Optional) */}
              <div className="mb-4">
                {!showAgent4 ? (
                  <button
                    type="button"
                    onClick={() => setShowAgent4(true)}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    + Add Agent #4 (Optional)
                  </button>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-300">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold" style={{ color: '#003B5C' }}>
                        Agent #4 (Optional)
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAgent4(false);
                          const newTeamMembers = [...teamMembers];
                          newTeamMembers[2] = { name: '', phone: '', email: '', title: '', photo: '' };
                          setTeamMembers(newTeamMembers);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={teamMembers[2]?.name || ''}
                          onChange={(e) => {
                            const newTeamMembers = [...teamMembers];
                            newTeamMembers[2] = { ...newTeamMembers[2], name: e.target.value };
                            setTeamMembers(newTeamMembers);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={teamMembers[2]?.title || ''}
                          onChange={(e) => {
                            const newTeamMembers = [...teamMembers];
                            newTeamMembers[2] = { ...newTeamMembers[2], title: e.target.value };
                            setTeamMembers(newTeamMembers);
                          }}
                          placeholder="e.g., President"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={teamMembers[2]?.phone || ''}
                          onChange={(e) => {
                            const newTeamMembers = [...teamMembers];
                            newTeamMembers[2] = { ...newTeamMembers[2], phone: e.target.value };
                            setTeamMembers(newTeamMembers);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={teamMembers[2]?.email || ''}
                          onChange={(e) => {
                            const newTeamMembers = [...teamMembers];
                            newTeamMembers[2] = { ...newTeamMembers[2], email: e.target.value };
                            setTeamMembers(newTeamMembers);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <FileUpload
                          label="Agent Photo"
                          accept="image/*"
                          fileType="image"
                          onFilesSelected={(files) => {
                            const newTeamMembers = [...teamMembers];
                            newTeamMembers[2] = { ...newTeamMembers[2], photo: files[0] || '' };
                            setTeamMembers(newTeamMembers);
                          }}
                          showPreview={true}
                          maxSizeMB={5}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Proposal Date */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proposal Date *
                </label>
                <input
                  type="date"
                  required
                  value={proposalDate}
                  onChange={(e) => setProposalDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                />
              </div>
            </section>

            {/* Client Information */}
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: '#003B5C' }}>
                Client Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientInfo.firstName}
                    onChange={(e) => setClientInfo({ ...clientInfo, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientInfo.lastName}
                    onChange={(e) => setClientInfo({ ...clientInfo, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mailing Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientInfo.address}
                    onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientInfo.city}
                    onChange={(e) => setClientInfo({ ...clientInfo, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientInfo.state}
                    onChange={(e) => setClientInfo({ ...clientInfo, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientInfo.zip}
                    onChange={(e) => setClientInfo({ ...clientInfo, zip: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  />
                </div>
              </div>
            </section>

            {/* Declaration Page Upload Section */}
            <section className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
              <h2 className="text-2xl font-semibold mb-4" style={{ color: '#003B5C' }}>
                Upload Policy Documents (Optional)
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Upload your client&apos;s existing policy declaration pages and new carrier proposals.
                We&apos;ll automatically extract and populate the form fields below.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FileUpload
                    label="Current Declaration Pages (PDF)"
                    accept=".pdf"
                    fileType="pdf"
                    multiple={true}
                    onFilesSelected={(files) => setUploadedFiles({ ...uploadedFiles, currentDecPages: files })}
                    existingFiles={uploadedFiles.currentDecPages}
                    showPreview={false}
                    maxSizeMB={10}
                  />
                </div>
                <div>
                  <FileUpload
                    label="New Proposals (PDF)"
                    accept=".pdf"
                    fileType="pdf"
                    multiple={true}
                    onFilesSelected={(files) => setUploadedFiles({ ...uploadedFiles, newProposals: files })}
                    existingFiles={uploadedFiles.newProposals}
                    showPreview={false}
                    maxSizeMB={10}
                  />
                </div>
              </div>
              {(uploadedFiles.currentDecPages.length > 0 || uploadedFiles.newProposals.length > 0) && (
                <div className="mt-4 space-y-3">
                  <div className="p-4 bg-blue-100 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>📄 {uploadedFiles.currentDecPages.length + uploadedFiles.newProposals.length} file(s) uploaded successfully!</strong>
                    </p>
                    <p className="text-xs text-blue-700 mt-2">
                      Click &quot;Extract Data&quot; to automatically populate form fields from your PDFs.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExtractData}
                    disabled={isExtracting}
                    className="w-full px-6 py-3 text-white font-semibold rounded-md shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#D4AF37' }}
                  >
                    {isExtracting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Extracting Data from PDF...
                      </span>
                    ) : (
                      '🤖 Extract Data from PDFs'
                    )}
                  </button>
                  {extractionError && (
                    <div className="p-3 bg-red-100 border border-red-300 rounded-md">
                      <p className="text-sm text-red-800">{extractionError}</p>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Coverage Selection */}
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: '#003B5C' }}>
                Select Coverage Types
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {coverageTypes.map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center space-x-3 p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCoverages.has(key)}
                      onChange={() => handleCoverageToggle(key)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: '#003B5C' }}
                    />
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Dynamic Coverage Forms */}
            {Array.from(selectedCoverages).map((coverageType) => {
              const template = coverageTemplates[coverageType];
              return (
                <section key={coverageType} className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4" style={{ color: '#003B5C' }}>
                    {template.title}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {template.fields.map((field) => (
                      <div
                        key={field.id}
                        className={field.type === 'textarea' ? 'md:col-span-2' : ''}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label} {field.required && '*'}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea
                            required={field.required}
                            value={coverageData[coverageType]?.[field.id] || ''}
                            onChange={(e) =>
                              handleCoverageFieldChange(coverageType, field.id, e.target.value)
                            }
                            placeholder={field.placeholder}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                          />
                        ) : (
                          <input
                            type={field.type}
                            required={field.required}
                            value={coverageData[coverageType]?.[field.id] || ''}
                            onChange={(e) =>
                              handleCoverageFieldChange(coverageType, field.id, e.target.value)
                            }
                            placeholder={field.placeholder}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Executive Summary */}
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: '#003B5C' }}>
                Executive Summary
              </h2>
              <textarea
                value={executiveSummary}
                onChange={(e) => setExecutiveSummary(e.target.value)}
                placeholder="Provide a high-level overview of the proposal..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
              />
            </section>

            {/* Additional Notes */}
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: '#003B5C' }}>
                Additional Notes
              </h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes or comments..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
              />
            </section>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="button"
                onClick={handleGenerateWord}
                disabled={isGenerating || selectedCoverages.size === 0}
                className="px-8 py-3 text-white font-semibold rounded-md shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#003B5C' }}
              >
                {isGenerating ? 'Generating Document...' : 'Generate Proposal Document'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Metro Point Technology - Insurance Proposal Generator</p>
          <p className="mt-1" style={{ color: '#D4AF37' }}>
            Professional WRAP Proposals Made Easy
          </p>
        </div>
      </div>
    </div>
  );
}
