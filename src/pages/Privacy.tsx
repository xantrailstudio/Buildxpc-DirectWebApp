export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto py-12 prose prose-slate">
      <h1 className="text-4xl font-bold tracking-tighter mb-8">Privacy Policy</h1>
      <div className="space-y-6 text-black/70 leading-relaxed">
        <p>Last updated: April 2026</p>
        <section>
          <h2 className="text-2xl font-bold text-black mb-4">1. Information We Collect</h2>
          <p>We collect minimal information required to provide our services. This includes authentication data if you choose to sign in via Google.</p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-black mb-4">2. How We Use Data</h2>
          <p>Your data is used solely for personalizing your experience, such as saving parts or managing your profile. We do not sell your data to third parties.</p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-black mb-4">3. Cookies</h2>
          <p>We use essential cookies to maintain your session and preferences. Analytics cookies help us understand how the platform is used.</p>
        </section>
      </div>
    </div>
  );
}
