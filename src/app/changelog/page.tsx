// app/changelog/page.tsx
import ChangeLog from '../component/ChangeLog';
import NavBar from '../component/navbar';

export default function ChangeLogPage() {
    return (
        <>
          <NavBar />
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-700">Change Log</h1>
                <div className="container mx-auto py-8">
                    <ChangeLog />
                </div>
          </div>
        </>
      );
    }