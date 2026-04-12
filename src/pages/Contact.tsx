import { motion } from 'motion/react';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';

export default function Contact() {
  return (
    <div className="max-w-4xl mx-auto py-12 md:py-24 px-4 space-y-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">Contact Us</h1>
        <p className="text-black/50 text-lg max-w-2xl mx-auto">
          Have questions or feedback? We'd love to hear from you. Our team is here to help you with your hardware research.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="p-8 bg-white border border-black/5 rounded-3xl space-y-8 shadow-sm"
        >
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-cyan-50 rounded-xl">
                <Mail className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Email Us</h3>
                <p className="text-black/50">For general inquiries and support</p>
                <a href="mailto:xantrailstudio@gmail.com" className="text-cyan-600 font-bold hover:underline">xantrailstudio@gmail.com</a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-cyan-50 rounded-xl">
                <Phone className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Call Us</h3>
                <p className="text-black/50">Available Mon-Fri, 9am-6pm</p>
                <a href="tel:+923003089553" className="text-cyan-600 font-bold hover:underline">+92 300 3089553</a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-cyan-50 rounded-xl">
                <MapPin className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Location</h3>
                <p className="text-black/50">Xan Trail Studio HQ</p>
                <p className="text-black/80 font-medium">Global Digital Presence</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="p-8 bg-black text-white rounded-3xl space-y-6 shadow-xl"
        >
          <div className="p-3 bg-white/10 w-fit rounded-xl">
            <MessageSquare className="w-6 h-6 text-cyan-400" />
          </div>
          <h3 className="text-2xl font-bold">Quick Message</h3>
          <p className="text-white/60">
            The fastest way to get a response is via email. We typically reply within 24 hours.
          </p>
          <div className="pt-4">
            <a 
              href="mailto:xantrailstudio@gmail.com" 
              className="inline-flex items-center justify-center w-full h-14 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-2xl transition-colors"
            >
              Send an Email
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
