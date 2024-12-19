// app/faq/page.tsx
import NavBar from '../component/navbar';
import { colors } from '../styles/colors';

export default function FAQ() {
  return (
    <>
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-700">Frequently Asked Questions</h1>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-700">What is this site for?</h2>
            <p className="text-gray-700">
              This site is for mile chasers to get information about credit cards and miles in an easy to understand format without poring through lengthy terms and conditions. This is a beta version and we are constantly improving it. If you have any feedback, please let us know by <a href="https://form.jotform.com/242924826608464" target="_target" rel="noopener noreferrer" style={{ color: colors.primary }}>clicking here</a>.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-700">Where do you get the information from?</h2>
            <p className="text-gray-700">
              I get the information from the Terms and Conditions of the credit cards from the various banks and certain content from the website <a href="https://milelion.com" target="_target" className="font-bold" style={{ color: colors.primary }}>https://www.milelion.com</a>. Do pay these sites a visit for more in-depth information.
            </p>
          </div>
          {/* <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-700">What cards are supported here?</h2>
            <p className="text-gray-700">Cards supported are the following:</p>
            <ul className="list-disc list-inside ml-4 mt-2 text-gray-700">
            <li>AMEX High Flyer Card</li>
            <li>Citibank Rewards Card</li>
            <li>DBS Woman&apos;s World Credit Card</li>
            <li>HSBC Revolution Card</li>
            <li>OCBC Rewards Card</li>
            <li>UOB Prvi Miles Card</li>
            <li>UOB Visa Signature Card</li>
            </ul>
          </div> */}
        </div>
      </div>
    </>
  );
}