

const AboutPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-10">
      <h1 className="text-4xl font-bold text-blue-800 mb-6">About GeneScope</h1>
      <section className="mb-10">
        <p className="text-lg text-gray-700 mb-4">
          <b>GeneScope</b> is a modern, user-friendly platform for DNA sequence analysis. Our advanced algorithms provide insights into genetic markers, mutations, and health traits, all with a focus on privacy and ease of use.
        </p>
        <ul className="list-disc ml-8 text-gray-700 text-base mb-4">
          <li>Analyze your DNA for known mutations and traits</li>
          <li>Visualize sequence alignments and mutation locations</li>
          <li>Download professional, humanized reports</li>
          <li>All data is processed securely and never shared</li>
        </ul>
        <p className="text-base text-gray-600">
          Whether you're a bioinformatics enthusiast, a healthcare professional, or just exploring your ancestry, GeneScope empowers you to unlock the secrets of your DNA with confidence and clarity.
        </p>
      </section>
      <section>
        <h2 className="text-2xl font-bold text-purple-700 mb-4">About the Developer</h2>
        <div className="flex items-center mb-4">
          <img src="/developer-avatar.png" alt="Developer" className="w-20 h-20 rounded-full mr-6 border-4 border-blue-200" />
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Anshu Chauhan</h3>
            <p className="text-gray-600">Full Stack Developer & Bioinformatics Enthusiast</p>
          </div>
        </div>
        <p className="text-gray-700 mb-2">
          Hi! I'm <b>Anshu</b>, the creator of GeneScope. I am passionate about making complex science accessible and empowering people to explore their own genetic data. I built this app using modern web technologies (React, FastAPI, MongoDB, and BioPython) to provide a seamless and secure experience for users of all backgrounds.
        </p>
        <p className="text-gray-700">
          If you have feedback, ideas, or want to collaborate, feel free to reach out via <a href="mailto:your.email@example.com" className="text-blue-600 underline">email</a> or connect on <a href="https://github.com/your-github" className="text-blue-600 underline">GitHub</a>.
        </p>
      </section>
    </div>
  </div>
);

export default AboutPage; 