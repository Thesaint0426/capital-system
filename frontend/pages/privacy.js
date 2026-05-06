import Head from 'next/head';
import { LegalPageLayout } from '../components/LegalPageLayout';

export default function PrivacyPage() {
  return (
    <>
      <Head><title>Privacy Policy — Capital Invest</title></Head>
      <LegalPageLayout
        eyebrow="Legal"
        title="Privacy Policy"
        lastUpdated="May 2025"
        sections={[
          {
            heading: 'Our Commitment',
            body: 'Capital Invest respects your privacy and is committed to protecting your personal data. This policy explains how we collect, use, and safeguard your information when you use our platform.',
          },
          {
            heading: 'Information We Collect',
            body: 'We may collect the following categories of information:',
            list: [
              'Personal identification — name, email address',
              'Contact information — WhatsApp, Telegram, or other provided contact details',
              'Account activity data — cycle history, liquidity requests, balance information',
              'Application data — source of funds declaration, country of residence',
              'Technical data — IP address, browser type, device information (for security purposes)',
            ],
          },
          {
            heading: 'Use of Information',
            body: 'Your data is used exclusively to:',
            list: [
              'Operate and maintain the platform',
              'Manage and administer your member account',
              'Process liquidity requests and cycle transactions',
              'Communicate platform updates and important notices',
              'Ensure the security and integrity of the platform',
              'Comply with legal and regulatory obligations',
            ],
          },
          {
            heading: 'Data Protection',
            body: 'We implement industry-standard security measures to prevent unauthorised access, alteration, disclosure, or destruction of your personal data. Access to your data is strictly limited to authorised personnel.',
          },
          {
            heading: 'Data Sharing',
            body: 'We do not sell, rent, or trade your personal data to third parties. Information may be shared only in the following circumstances:',
            list: [
              'When required by applicable law or regulatory authority',
              'When strictly necessary for platform operations with trusted service providers',
              'To protect the rights, property, or safety of Capital Invest or its members',
            ],
          },
          {
            heading: 'Data Retention',
            body: 'We retain your personal data for as long as your account remains active or as required by applicable law. You may request deletion of your data by contacting us directly.',
          },
          {
            heading: 'User Responsibility',
            body: 'You are responsible for keeping your account credentials secure. Do not share your password or account access with any third party. Notify us immediately if you suspect any unauthorised use of your account.',
          },
          {
            heading: 'Your Rights',
            body: 'Depending on your jurisdiction, you may have the right to:',
            list: [
              'Access the personal data we hold about you',
              'Request correction of inaccurate data',
              'Request deletion of your data',
              'Object to certain processing activities',
            ],
          },
          {
            heading: 'Updates to This Policy',
            body: 'This Privacy Policy may be updated periodically to reflect changes in our practices or legal requirements. We encourage you to review this page regularly. Continued use of the platform constitutes acceptance of any updated policy.',
          },
          {
            heading: 'Contact',
            body: 'For any privacy-related questions or requests, please contact us at: contact@capitalinvest.live',
          },
        ]}
      />
    </>
  );
}
