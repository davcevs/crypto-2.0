import { motion } from "framer-motion";
import { TrendingUp, ShieldCheck, Wallet } from "lucide-react";

const Features = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Why Choose Us</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            icon: <TrendingUp size={40} className="text-blue-500" />,
            title: "Real-Time Trading",
            desc: "Lightning-fast trades with minimal latency",
          },
          {
            icon: <ShieldCheck size={40} className="text-green-500" />,
            title: "Maximum Security",
            desc: "Bank-grade encryption and multi-factor authentication",
          },
          {
            icon: <Wallet size={40} className="text-purple-500" />,
            title: "Portfolio Management",
            desc: "Advanced tracking and insights for your investments",
          },
        ].map((feature, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -10 }}
            className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center"
          >
            <div className="flex justify-center mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-400">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Features;
