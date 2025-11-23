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
    email: ''
  });

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

  // New state for agency branding
  const [agencyLogo, setAgencyLogo] = useState<string>('');
  const [agencyName, setAgencyName] = useState<string>('');
  const [agentPhoto, setAgentPhoto] = useState<string>('');

  // New state for file uploads
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({
    currentDecPages: [],
    newProposals: []
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const proposalData: ProposalData = {
        proposalDate,
        agentInfo,
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
                  <FileUpload
                    label="Agent Photo"
                    accept="image/*"
                    fileType="image"
                    onFilesSelected={(files) => setAgentPhoto(files[0] || '')}
                    showPreview={true}
                    maxSizeMB={5}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agency Name
                  </label>
                  <input
                    type="text"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    placeholder="Metro Point Insurance"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  />
                </div>
              </div>
            </section>

            {/* Agent Information */}
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: '#003B5C' }}>
                Agent Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agent Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={agentInfo.name}
                    onChange={(e) => setAgentInfo({ ...agentInfo, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
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
                <div>
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
                    Address *
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
            <section className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
              <h2 className="text-2xl font-semibold mb-4" style={{ color: '#003B5C' }}>
                Upload Existing Policy Documents
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Upload your client&apos;s existing policy declaration pages and new carrier proposals.
                Files are securely stored and attached to your proposal.
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
              <div className="mt-4 p-4 bg-green-100 rounded-md">
                <p className="text-sm text-green-800">
                  <strong>✓ Files uploaded successfully!</strong> Your documents are securely stored in Vercel Blob Storage and will be attached to your proposal.
                </p>
                <p className="text-xs text-green-700 mt-2">
                  OCR and automatic data extraction will be added in a future update.
                </p>
              </div>
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
                type="submit"
                disabled={isGenerating || selectedCoverages.size === 0}
                className="px-8 py-3 text-white font-semibold rounded-md shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#003B5C' }}
              >
                {isGenerating ? 'Generating PDF...' : 'Generate Proposal PDF'}
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
