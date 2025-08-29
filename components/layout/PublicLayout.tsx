import Navbar from '../Navbar';

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="p-6">{children}</main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        © 2023 MentorApp
      </footer>
    </div>
  );
};

export default PublicLayout;