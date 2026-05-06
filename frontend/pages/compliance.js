import Head from 'next/head';
import { LegalPageLayout } from '../components/LegalPageLayout';

export default function CompliancePage() {
  return (
    <>
      <Head><title>Compliance — Capital Invest</title></Head>
      <LegalPageLayout
        eyebrow="Legal"
        title="Compliance Statement"
        lastUpdated="May 2025"
        sections={[
          {
            heading: 'Platform Nature',
            body: 'Capital Invest operates as a private capital participation platform and not as a public investment offering. It is not registered as a brokerage, bank, or regulated investment fund.',
          },
          {
            heading: 'Not a Public Offering',
            body: 'The platform is not:',
            list: [
              'A brokerage or securities dealer',
              'A licensed bank or financial institution',
              'A regulated investment fund or collective investment scheme',
              'A public solicitation of investment of any kind',
            ],
          },
          {
            heading: 'Restricted Access',
            body: 'Access to Capital Invest is restricted to approved members only. The platform is not intended as a public solicitation of investment, and no marketing materials should be construed as such.',
          },
          {
            heading: 'Jurisdiction Responsibility',
            body: 'Users are solely responsible for ensuring that their participation in Capital Invest complies with all applicable laws and regulations in their country or jurisdiction of residence. Capital Invest does not make representations regarding the legality of participation in any specific jurisdiction.',
          },
          {
            heading: 'Anti-Money Laundering (AML)',
            body: 'Capital Invest takes AML obligations seriously. We reserve the right to:',
            list: [
              'Request identity verification documents at any time',
              'Reject or suspend accounts that raise AML concerns',
              'Report suspicious activity to relevant authorities as required by law',
              'Delay or refuse transactions pending AML review',
            ],
          },
          {
            heading: 'Know Your Customer (KYC)',
            body: 'Identity and source-of-funds verification may be required before full account activation or processing of liquidity requests. Failure to provide required documentation may result in account restriction or closure.',
          },
          {
            heading: 'Refusal Rights',
            body: 'Capital Invest reserves the right to:',
            list: [
              'Deny access to any applicant without providing a reason',
              'Restrict or suspend existing member accounts',
              'Refuse or reverse transactions at our sole discretion',
              'Terminate membership in cases of policy violation or compliance risk',
            ],
          },
          {
            heading: 'Regulatory Awareness',
            body: 'Users acknowledge that financial regulations vary significantly by jurisdiction. Participation is undertaken entirely at the user\'s own responsibility. Capital Invest shall not be held liable for any regulatory consequences arising from a user\'s participation.',
          },
          {
            heading: 'Contact',
            body: 'For compliance-related inquiries, please contact us at: contact@capitalinvest.live',
          },
        ]}
      />
    </>
  );
}
