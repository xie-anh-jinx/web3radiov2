import React from 'react';
import NavBar from '@/components/navigation/NavBar';
import { Shield } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen w-full bg-transparent relative overflow-y-auto text-white flex flex-col items-center">
            <NavBar />

            <div className="flex flex-col items-center mb-12 px-4 mt-32 md:mt-40 w-full max-w-4xl">
                <div className="flex items-center gap-4 mb-8 opacity-80">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tighter text-white/90">Privacy Policy</h1>
                        <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">Web3Radio Legal Documentation</p>
                    </div>
                </div>

                <div className="card-apple p-8 md:p-12 w-full space-y-8 text-white/80 leading-relaxed backdrop-blur-3xl">
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">Introduction</h2>
                        <p>
                            Web3Radio (“we,” “our,” or “us”) respects your privacy and is committed to protecting the personal information of users, creators, broadcasters, musicians, contributors, and visitors who access our platform and services.
                        </p>
                        <p>
                            This Privacy Policy explains how we collect, use, store, process, and protect information when you use Web3Radio, including our website, applications, payment systems, creator tools, streaming services, and blockchain-related features.
                        </p>
                        <p>
                            By using Web3Radio, you agree to the practices described in this Privacy Policy.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">Information We Collect</h2>
                        <p>We may collect the following categories of information:</p>
                        
                        <div className="space-y-6 mt-4">
                            <div>
                                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    1. Account Information
                                </h3>
                                <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-white/60">
                                    <li>Username or display name</li>
                                    <li>Email address</li>
                                    <li>Social login information</li>
                                    <li>Wallet address</li>
                                    <li>Profile information provided by users</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    2. Payment Information
                                </h3>
                                <p className="mb-2">When users make payments, tips, or creator support transactions, we may collect:</p>
                                <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-white/60">
                                    <li>Transaction identifiers</li>
                                    <li>Wallet addresses</li>
                                    <li>Payment status</li>
                                    <li>Limited billing-related information</li>
                                </ul>
                                <p className="mt-2 text-sm italic text-white/50">
                                    Fiat payment processing may be handled by third-party payment providers such as MoonPay or other licensed payment infrastructure providers. We do not store full credit card information.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    3. Usage Information
                                </h3>
                                <p className="mb-2">We may collect technical and usage data including:</p>
                                <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-white/60">
                                    <li>IP address</li>
                                    <li>Browser type</li>
                                    <li>Device information</li>
                                    <li>Operating system</li>
                                    <li>Access timestamps</li>
                                    <li>Pages visited</li>
                                    <li>Streaming activity</li>
                                    <li>Interaction data</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    4. Blockchain Data
                                </h3>
                                <p>
                                    Certain blockchain-related information may be publicly visible by design, including wallet addresses and onchain transactions.
                                </p>
                                <p className="text-sm italic text-white/50">
                                    Users acknowledge that blockchain networks are decentralized and public in nature.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">How We Use Information</h2>
                        <ul className="list-disc list-inside space-y-2 text-white/70">
                            <li>Provide and operate the Web3Radio platform</li>
                            <li>Enable broadcasting and streaming services</li>
                            <li>Process payments, tipping, and creator support</li>
                            <li>Improve user experience and platform performance</li>
                            <li>Prevent fraud, abuse, or unauthorized activity</li>
                            <li>Comply with legal obligations</li>
                            <li>Communicate with users regarding updates, security, or support</li>
                            <li>Support analytics and ecosystem growth</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">Payment and Third-Party Services</h2>
                        <p>Web3Radio may integrate third-party providers for:</p>
                        <ul className="grid grid-cols-2 gap-2 text-sm text-white/60 ml-4 mt-2">
                            <li>• Fiat payments</li>
                            <li>• Crypto payments</li>
                            <li>• Wallet infrastructure</li>
                            <li>• Analytics</li>
                            <li>• Authentication</li>
                            <li>• Content delivery</li>
                            <li>• Streaming services</li>
                        </ul>
                        <p className="mt-4 text-sm italic text-white/50">
                            These third-party providers may collect and process information according to their own privacy policies.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">Cookies and Tracking Technologies</h2>
                        <p>We may use cookies and similar technologies to:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-white/60">
                            <li>Maintain sessions</li>
                            <li>Improve platform functionality</li>
                            <li>Analyze traffic and performance</li>
                            <li>Remember user preferences</li>
                        </ul>
                        <p className="mt-4">
                            Users may disable cookies through browser settings, although some platform features may not function properly.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">Data Sharing</h2>
                        <p>We do not sell personal information.</p>
                        <p>We may share information only when necessary to:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-white/60">
                            <li>Provide requested services</li>
                            <li>Process payments</li>
                            <li>Comply with legal obligations</li>
                            <li>Protect platform security</li>
                            <li>Prevent fraud or abuse</li>
                            <li>Work with infrastructure or technology partners</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">Data Security</h2>
                        <p>
                            We implement reasonable administrative, technical, and organizational measures to protect user information from unauthorized access, disclosure, alteration, or destruction.
                        </p>
                        <p className="text-sm italic text-white/50">
                            However, no method of internet transmission or electronic storage is completely secure.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">User Rights</h2>
                        <p>Depending on applicable laws and jurisdictions, users may have rights to:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-white/60 ml-4 mt-2">
                            <li>• Access personal information</li>
                            <li>• Request correction of inaccurate information</li>
                            <li>• Request deletion of data</li>
                            <li>• Withdraw consent where applicable</li>
                            <li>• Request information about data processing</li>
                        </div>
                        <p className="mt-4">Requests may be submitted through our contact channels.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">International Users</h2>
                        <p>
                            Web3Radio operates globally. By using the platform, users understand that information may be processed and stored in jurisdictions outside their country of residence.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">Children’s Privacy</h2>
                        <p>
                            Web3Radio is not intended for children under the age required by applicable laws in their jurisdiction. We do not knowingly collect personal information from children.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">Changes to This Privacy Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. Updated versions will be posted on our website with a revised effective date.
                        </p>
                        <p>
                            Continued use of the platform after updates constitutes acceptance of the revised Privacy Policy.
                        </p>
                    </section>

                    <section className="space-y-6 pt-8 border-t border-white/10">
                        <h2 className="text-xl font-bold text-white">Contact Information</h2>
                        <p>If you have questions regarding this Privacy Policy, you may contact us at:</p>
                        <div className="bg-white/5 rounded-2xl p-6 space-y-2 border border-white/5">
                            <p className="font-bold text-white">Web3Radio</p>
                            <p className="text-sm">Email: hi@webthreeradio.xyz</p>
                            <p className="text-sm">Website: <a href="https://app.webthreeradio.xyz" className="text-blue-400 hover:underline">app.webthreeradio.xyz</a></p>
                        </div>
                    </section>
                </div>

                <div className="mt-12 mb-20 text-center opacity-40 text-[10px] uppercase tracking-widest">
                    <p>© 2026 Web3Radio • All Rights Reserved</p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
