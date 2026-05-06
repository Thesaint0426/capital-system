import Head from 'next/head';
import { LegalPageLayout } from '../components/LegalPageLayout';

export default function TermsPage() {
  return (
    <>
      <Head><title>Terms of Service — Capital Invest</title></Head>
      <LegalPageLayout
        eyebrow="Legal"
        title="Terms of Service"
        lastUpdated="May 2025"
        sections={[
          {
            heading: 'Agreement',
            body: 'By accessing or using Capital Invest, you agree to be bound by these Terms of Service in full. If you do not agree, you must discontinue use of the platform immediately.',
          },
          {
            heading: 'Eligibility',
            body: 'To participate on this platform, you must:',
            list: [
              'Be at least 18 years of age',
              'Be legally permitted to participate in financial activities in your jurisdiction',
              'Have submitted and received approval through the official application process',
            ],
          },
          {
            heading: 'Account Responsibility',
            body: 'You are solely responsible for:',
            list: [
              'Maintaining the confidentiality of your account credentials',
              'All activities that occur under your account',
              'Notifying us immediately of any unauthorised access or security breach',
            ],
          },
          {
            heading: 'Platform Access',
            body: 'Access to Capital Invest is granted on a revocable, non-transferable basis. We reserve the right to modify, suspend, or terminate access at any time, with or without notice, at our sole discretion.',
          },
          {
            heading: 'Prohibited Use',
            body: 'You agree not to:',
            list: [
              'Use the platform for any illegal or fraudulent purpose',
              'Attempt to exploit, reverse-engineer, or disrupt the system',
              'Misrepresent your identity or provide false information',
              'Transfer or share your account access with any third party',
              'Engage in any activity that compromises platform integrity',
            ],
          },
          {
            heading: 'Capital Participation',
            body: 'All capital participation is entirely voluntary and undertaken at your own risk. You acknowledge that you have read, understood, and accepted our Risk Disclosure prior to any participation.',
          },
          {
            heading: 'Modifications',
            body: 'Capital Invest reserves the right to modify platform features, policies, and these Terms at any time. Continued use of the platform following any modification constitutes your acceptance of the revised Terms.',
          },
          {
            heading: 'Termination',
            body: 'We reserve the right to suspend or permanently terminate accounts that violate our policies, engage in prohibited activities, or pose a risk to the platform or its members.',
          },
          {
            heading: 'Limitation of Liability',
            body: 'To the fullest extent permitted by law, Capital Invest shall not be liable for:',
            list: [
              'Financial losses arising from participation',
              'System interruptions or technical failures',
              'Third-party service failures or outages',
              'Decisions made based on platform data or communications',
            ],
          },
        ]}
      />
    </>
  );
}
