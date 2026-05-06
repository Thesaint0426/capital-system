import Head from 'next/head';
import { LegalPageLayout } from '../components/LegalPageLayout';

export default function WithdrawalPolicyPage() {
  return (
    <>
      <Head><title>Liquidity Policy — Capital Invest</title></Head>
      <LegalPageLayout
        eyebrow="Legal"
        title="Liquidity Policy"
        lastUpdated="May 2025"
        sections={[
          {
            heading: 'Overview',
            body: 'Capital Invest provides a structured liquidity system designed to ensure operational stability and fairness for all members.',
          },
          {
            heading: 'Request Submission',
            body: 'All liquidity requests must be submitted through the member Investor Interface. Requests submitted outside of the platform will not be processed.',
          },
          {
            heading: 'Processing Conditions',
            body: 'Liquidity requests may be subject to:',
            list: [
              'Active cycle status — requests cannot be processed while a cycle is running',
              'Internal review procedures',
              'Compliance and security checks',
            ],
          },
          {
            heading: 'Processing Time',
            body: 'Requests are typically processed within 24–72 hours after approval. Delays may occur due to operational or security review requirements.',
          },
          {
            heading: 'Fees',
            body: 'A processing fee applies to all liquidity requests. The exact amount is displayed prior to submission confirmation. No hidden charges apply.',
          },
          {
            heading: 'Wallet Accuracy',
            body: 'Users are solely responsible for providing correct wallet addresses and network details. Capital Invest is not liable for funds sent to incorrect addresses provided by the user. Always verify your wallet address before submitting a request.',
          },
          {
            heading: 'Right to Refuse',
            body: 'Capital Invest reserves the right to delay, limit, or refuse liquidity requests in cases involving:',
            list: [
              'Suspicious or unusual account activity',
              'Security concerns or potential account compromise',
              'Policy or compliance violations',
              'Ongoing identity verification requirements',
            ],
          },
        ]}
      />
    </>
  );
}
