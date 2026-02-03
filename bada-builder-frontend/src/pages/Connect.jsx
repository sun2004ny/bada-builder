import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/Motion/PageTransition';
import { leadsAPI } from '../services/api';
import {

    RiSendPlaneFill,
    RiCheckLine,
    RiErrorWarningLine
} from 'react-icons/ri';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const BackgroundGraphics = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            {/* Dynamic Blob 1 */}
            <motion.div
                animate={{
                    x: [0, 100, 0],
                    y: [0, 50, 0],
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0]
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute -top-20 -left-20 w-96 h-96 bg-primary/20 blur-[100px] rounded-full"
            />
            {/* Dynamic Blob 2 */}
            <motion.div
                animate={{
                    x: [0, -100, 0],
                    y: [0, 100, 0],
                    scale: [1, 1.1, 1],
                    rotate: [0, -45, 0]
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute top-1/2 -right-20 w-80 h-80 bg-purple-500/10 blur-[100px] rounded-full"
            />
            {/* Dynamic Blob 3 */}
            <motion.div
                animate={{
                    y: [0, -150, 0],
                    x: [0, 50, 0],
                    scale: [1, 1.3, 1]
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute -bottom-20 left-1/4 w-72 h-72 bg-blue-400/10 blur-[80px] rounded-full"
            />
        </div>
    );
};

const FloatingInput = ({ label, id, type = "text", required = false, name, value, onChange, textarea = false }) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value && value.length > 0;

    const InputComponent = textarea ? 'textarea' : 'input';

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
            }}
            className="relative mb-6 group w-full"
        >
            <InputComponent
                id={id}
                name={name}
                type={type}
                required={required}
                value={value}
                onChange={onChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                rows={textarea ? 4 : undefined}
                className={classNames(
                    "block w-full px-4 pt-6 pb-2 text-neutral-900 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-2 rounded-2xl appearance-none focus:outline-none focus:ring-0 transition-all duration-300",
                    isFocused || hasValue ? "border-primary shadow-lg shadow-primary/5" : "border-neutral-200 dark:border-neutral-800",
                    textarea ? "resize-none" : ""
                )}
                placeholder=" "
            />
            <label
                htmlFor={id}
                className={classNames(
                    "absolute left-4 top-4 z-10 origin-[0] transform transition-all duration-300 pointer-events-none",
                    isFocused || hasValue
                        ? "scale-75 -translate-y-3.5 text-primary font-bold"
                        : "scale-100 translate-y-0 text-neutral-500"
                )}
            >
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            <AnimatePresence>
                {isFocused && (
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        exit={{ scaleX: 0 }}
                        className="absolute bottom-0 left-0 h-0.5 bg-primary w-full origin-left rounded-full z-20"
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const Connect = () => {
    const navigate = useNavigate();
    const [agreed, setAgreed] = useState(false);
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const formRef = useRef(null);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        company: '',
        user_email: '',
        phone: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (sending) return;

        setStatus(null);
        setStatusMessage('');

        if (!agreed) {
            setStatus('error');
            setStatusMessage('Please agree to allow us to contact you.');
            return;
        }

        setSending(true);

        try {
            // Map form data to leads API schema
            // Schema: name, requirement_type, location, phone
            const leadData = {
                name: `${formData.first_name} ${formData.last_name}`,
                phone: formData.phone,
                location: formData.company || 'Online Inquiry',
                // Combining email and message into requirement_type since it's the specific field we have
                requirement_type: `Email: ${formData.user_email} - Msg: ${formData.message}`
            };

            await leadsAPI.create(leadData);

            setStatus('success');
            setStatusMessage('Message sent! Returning soon.');
            setTimeout(() => navigate('/'), 3000);
        } catch (error) {
            console.error('Failed to send message:', error);
            setStatus('error');
            setStatusMessage('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <PageTransition>
            <div className="relative min-h-screen pt-2 pb-16 px-6 overflow-hidden bg-neutral-50 dark:bg-black">
                <BackgroundGraphics />

                <div className="relative mx-auto max-w-2xl text-center mb-7 z-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-9xl font-black text-black dark:text-white tracking-tighter"
                    >
                        Let's <span className="text-black dark:text-neutral-100">Connect</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-4 text-lg text-neutral-500 dark:text-neutral-400"
                    >
                        Our team is here to help you secure your legacy.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 100 }}
                    whileHover={{ y: -5 }}
                    className="relative mx-auto max-w-xl p-[2px] rounded-[2.6rem] bg-gradient-to-br from-primary via-purple-500 to-blue-500 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] z-10 overflow-hidden"
                >
                    <div className="relative bg-white/90 dark:bg-neutral-950/90 backdrop-blur-3xl p-8 md:p-12 rounded-[2.5rem] h-full w-full overflow-hidden">
                        {/* Vibrant Mesh Gradient Effects */}
                        <div className="absolute -top-32 -left-32 w-80 h-80 bg-purple-500/20 blur-[80px] rounded-full pointer-events-none animate-pulse" />
                        <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/20 blur-[80px] rounded-full pointer-events-none animate-pulse" />
                        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none animate-pulse" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

                        <AnimatePresence mode="wait">
                            {status && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                    className={classNames(
                                        "mb-8 p-4 rounded-2xl flex items-center gap-3 border",
                                        status === 'success' ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
                                    )}
                                >
                                    {status === 'success' ? <RiCheckLine className="text-xl" /> : <RiErrorWarningLine className="text-xl" />}
                                    <span className="text-sm font-medium">{statusMessage}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.form
                            ref={formRef}
                            onSubmit={handleSubmit}
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-2"
                        >
                            <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                                <FloatingInput label="First name" id="first_name" name="first_name" required value={formData.first_name} onChange={handleChange} />
                                <FloatingInput label="Last name" id="last_name" name="last_name" required value={formData.last_name} onChange={handleChange} />
                            </div>

                            <FloatingInput label="Company (Optional)" id="company" name="company" value={formData.company} onChange={handleChange} />
                            <FloatingInput label="Email Address" id="user_email" name="user_email" type="email" required value={formData.user_email} onChange={handleChange} />

                            <div className="relative">
                                <FloatingInput label="Phone Number" id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleChange} />
                                <span className="absolute top-5 right-4 text-xs font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-lg">IND</span>
                            </div>

                            <FloatingInput label="Your Message" id="message" name="message" textarea required value={formData.message} onChange={handleChange} />

                            <motion.label
                                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                                className="flex items-start gap-4 py-6 group cursor-pointer w-fit"
                            >
                                <div className="relative flex items-center justify-center mt-0.5">
                                    <input
                                        type="checkbox"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="peer h-7 w-7 cursor-pointer appearance-none rounded-lg border-2 border-neutral-300 dark:border-neutral-700 transition-all duration-300 checked:bg-primary checked:border-primary"
                                    />
                                    <RiCheckLine className={classNames("absolute text-black transition-all duration-300 pointer-events-none text-xl", agreed ? "opacity-100 scale-100" : "opacity-0 scale-75")} />
                                    <div className="absolute inset-0 rounded-lg peer-focus:ring-2 peer-focus:ring-primary/30 peer-focus:ring-offset-2 transition-all duration-300 shadow-sm" />
                                </div>
                                <span className="text-base text-neutral-700 dark:text-neutral-300 select-none leading-tight font-medium">
                                    Agree to allow us to contact you via phone or email.
                                </span>
                            </motion.label>

                            <motion.button
                                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                                whileHover={{ scale: 1.02, backgroundPosition: "100% center" }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={sending || !agreed}
                                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-[length:200%_auto] py-4 px-6 text-white font-bold transition-all duration-500 hover:shadow-lg hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20"
                            >
                                <AnimatePresence mode="wait">
                                    {sending ? (
                                        <motion.div key="loader" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                            Sending...
                                        </motion.div>
                                    ) : (
                                        <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                            Let's talk
                                            <RiSendPlaneFill className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </motion.form>
                    </div>
                </motion.div>


            </div>
        </PageTransition>
    )
}

export default Connect
