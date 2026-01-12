


import { useState, useRef, useEffect } from 'react'

import { useNavigate } from 'react-router-dom'

import { sendForm, init } from '@emailjs/browser'

import { ChevronDownIcon } from '@heroicons/react/20/solid'

import { Switch } from '@headlessui/react'



//icons

import { RiInstagramFill, RiFacebookFill, RiTwitterFill, RiYoutubeFill } from 'react-icons/ri';



function classNames(...classes) {

    return classes.filter(Boolean).join(' ')

}



const Connect = () => {

    const navigate = useNavigate();

    const [agreed, setAgreed] = useState(false);

    const [sending, setSending] = useState(false);

    const [message, setMessage] = useState('');

    const formRef = useRef(null);



    useEffect(() => {

        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

        if (publicKey) init(publicKey);

    }, []);



    const handleSubmit = (e) => {

        e.preventDefault();

        if (sending) return;



        // Clear previous messages

        setMessage('');



        // Basic form validation

        const formData = new FormData(formRef.current);

        const firstName = formData.get('first_name');

        const lastName = formData.get('last_name');

        const email = formData.get('user_email');

        const phone = formData.get('phone');

        const messageText = formData.get('message');



        if (!firstName || !lastName || !email || !phone || !messageText) {

            setMessage('Please fill in all required fields.');

            return;

        }



        if (!agreed) {

            setMessage('Please agree to allow us to contact you via phone.');

            return;

        }



        setSending(true);



        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';

        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';

        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';



        if (!serviceId || !templateId || !publicKey) {

            setMessage('EmailJS not configured. Please contact support.');

            setSending(false);

            return;

        }



        console.log('📧 Sending contact form with EmailJS...');

        console.log('Service ID:', serviceId);

        console.log('Template ID:', templateId);



        // Log form data being sent

        const formDataForLog = new FormData(formRef.current);

        console.log('📋 Form data being sent:');

        for (let [key, value] of formDataForLog.entries()) {

            console.log(`  ${key}: ${value}`);

        }



        sendForm(serviceId, templateId, formRef.current, publicKey)

            .then((response) => {

                console.log('✅ Contact form sent successfully:', response.text);

                navigate('/');

            })

            .catch((error) => {

                console.error('❌ Failed to send contact form:', error);

                setMessage('Failed to send message. Please try again later or contact us directly.');

            })

            .finally(() => {

                setSending(false);

            });

    };



    return (

        <div className="isolate mt-44 mb-36 p-6 mx-auto max-w-sm sm:max-w-xl md:max-w-full lg:max-w-screen-xl">

            {sending && (

                <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">

                    <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">

                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>

                        <p className="mt-4 text-lg font-semibold text-gray-700">Sending your message...</p>

                    </div>

                </div>

            )}

            <div

                className="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]"

                aria-hidden="true"

            >

                <div

                    className="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem]"

                    style={{

                        clipPath:

                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',

                    }}

                />

            </div>



            <div className="mx-auto text-center">

                <h2 className="title">Contact Us</h2>

            </div>



            {message && (

                <div className="mx-auto mt-8 max-w-xl p-4 rounded-lg border bg-red-50 border-red-200 text-red-800">

                    <div className="flex items-center">

                        <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />

                        </svg>

                        <p className="text-sm font-medium">{message}</p>

                        <button

                            onClick={() => setMessage('')}

                            className="ml-auto text-gray-400 hover:text-gray-600"

                        >

                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />

                            </svg>

                        </button>

                    </div>

                </div>

            )}



            <form ref={formRef} onSubmit={handleSubmit} className="mx-auto mt-16 max-w-xl sm:mt-20">

                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">

                    <div>

                        <label htmlFor="first_name" className="block text-sm font-semibold leading-6 text-gray-600">

                            First name

                        </label>

                        <div className="mt-2.5">

                            <input

                                type="text"

                                name="first_name"

                                id="first_name"

                                autoComplete="given-name"

                                required

                                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"

                            />

                        </div>

                    </div>

                    <div>

                        <label htmlFor="last_name" className="block text-sm font-semibold leading-6 text-gray-600">

                            Last name

                        </label>

                        <div className="mt-2.5">

                            <input

                                type="text"

                                name="last_name"

                                id="last_name"

                                autoComplete="family-name"

                                required

                                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"

                            />

                        </div>

                    </div>

                    <div className="sm:col-span-2">

                        <label htmlFor="company" className="block text-sm font-semibold leading-6 text-gray-600">

                            Company

                        </label>

                        <div className="mt-2.5">

                            <input

                                type="text"

                                name="company"

                                id="company"

                                autoComplete="organization"

                                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"

                            />

                        </div>

                    </div>

                    <div className="sm:col-span-2">

                        <label htmlFor="user_email" className="block text-sm font-semibold leading-6 text-gray-600">

                            Email

                        </label>

                        <div className="mt-2.5">

                            <input

                                type="email"

                                name="user_email"

                                id="user_email"

                                autoComplete="email"

                                required

                                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"

                            />

                        </div>

                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="phone-number" className="block text-sm font-semibold leading-6 text-gray-600">
                            Phone number
                        </label>
                        <div className="relative mt-2.5">
                            <span className="absolute inset-y-0 left-0 flex items-center px-4 text-gray-600">
                                IND
                            </span>
                            <input
                                type="tel"
                                name="phone"
                                id="phone"
                                autoComplete="tel"
                                required
                                className="block w-full rounded-md border-0 px-3.5 py-2 pl-16 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>


                    <div className="sm:col-span-2">

                        <label htmlFor="message" className="block text-sm font-semibold leading-6 text-gray-600">

                            Message

                        </label>

                        <div className="mt-2.5">

                            <textarea

                                name="message"

                                id="message"

                                rows={4}

                                required

                                placeholder="Tell us about your inquiry..."

                                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"

                                defaultValue={''}

                            />

                        </div>

                    </div>

                    <Switch.Group as="div" className="flex gap-x-4 sm:col-span-2 justify-center">

                        <div className="flex h-6 items-center">

                            <Switch

                                checked={agreed}

                                onChange={setAgreed}

                                className={classNames(

                                    agreed ? 'bg-primary' : 'bg-gray-200',

                                    'flex w-8 flex-none cursor-pointer rounded-full p-px ring-1 ring-inset ring-gray-900/5 transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'

                                )}

                            >

                                <span className="sr-only">Agree to policies</span>

                                <span

                                    aria-hidden="true"

                                    className={classNames(

                                        agreed ? 'translate-x-3.5' : 'translate-x-0',

                                        'h-4 w-4 transform rounded-full bg-white shadow-sm ring-1 ring-gray-900/5 transition duration-200 ease-in-out'

                                    )}

                                />

                            </Switch>

                        </div>

                        <Switch.Label className="text-sm leading-6 text-gray-700">

                            By selecting this, you agree to allow us to contact you via phone

                        </Switch.Label>

                    </Switch.Group>

                </div>

                <div className="mt-10">

                    <button

                        type="submit"

                        disabled={sending || !agreed}

                        className="block w-full rounded-xl bg-primary px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-xl hover:bg-primary-hover focus:bg-primary-hover duration-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"

                    >

                        {sending ? (

                            <>

                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

                                Sending Message...

                            </>

                        ) : (

                            "Let's talk"

                        )}

                    </button>

                </div>

            </form>



            <div className="p-2 w-full pt-8 mt-8 border-t border-gray-200 text-center">

                <a href="mailto:info@headstart.co.in" className="text-primary font-semibold hover:text-gray-500 duration-300 transition-colors">info@headstart.co.in</a>

                <p className="leading-normal my-5 text-gray-700 ">

                    <a href="https://goo.gl/maps/Rko9qVf1rBpS9qe2A" className='hover:text-gray-500 duration-300 transition-colors'>

                        608-A, Pinnacle Business Park

                        <br />Corporate Road, Prahladnagar, Ahmedabad

                    </a>

                </p>

                <span className="inline-flex">

                    <a className="text-gray-500 hover:text-[#3b5998] cursor-pointer text-xl duration-300 transition-colors">

                        <RiFacebookFill />

                    </a>

                    <a className="ml-4 text-gray-500 hover:text-[#26a7de] cursor-pointer text-xl duration-300 transition-colors">

                        <RiTwitterFill />

                    </a>

                    <a className="ml-4 text-gray-500 hover:text-[#e2457a] cursor-pointer text-xl duration-300 transition-colors">

                        <RiInstagramFill />

                    </a>

                    <a className="ml-4 text-gray-500 hover:text-[#CD201F] cursor-pointer text-xl duration-300 transition-colors">

                        <RiYoutubeFill />

                    </a>

                </span>

            </div>



        </div>

    )

}



export default Connect
