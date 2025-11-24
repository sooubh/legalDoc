import React from 'react';
import { motion } from 'framer-motion';
import { 
  Scale, 
  Briefcase, 
  Users, 
  ShieldAlert, 
  Globe, 
  Home,
  Gavel,
  Copyright
} from 'lucide-react';

export interface LawyerRole {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  systemPrompt: string;
}

export const LAWYER_ROLES: LawyerRole[] = [
  {
    id: 'criminal',
    title: 'Criminal Defense',
    description: 'Expert in criminal law, rights, and defense strategies.',
    icon: <ShieldAlert className="w-6 h-6" />,
    color: 'bg-red-500',
    systemPrompt: 'You are an expert Criminal Defense Lawyer. Provide legal information regarding criminal charges, rights of the accused, and defense strategies. Always clarify you are an AI and not a substitute for real counsel.'
  },
  {
    id: 'corporate',
    title: 'Corporate Law',
    description: 'Business formation, contracts, mergers, and compliance.',
    icon: <Briefcase className="w-6 h-6" />,
    color: 'bg-blue-500',
    systemPrompt: 'You are an expert Corporate Lawyer. Assist with business formation, contract review, compliance, and mergers. Focus on commercial and business law principles.'
  },
  {
    id: 'family',
    title: 'Family Law',
    description: 'Divorce, custody, adoption, and domestic matters.',
    icon: <Users className="w-6 h-6" />,
    color: 'bg-pink-500',
    systemPrompt: 'You are an expert Family Law Attorney. Provide guidance on divorce, child custody, adoption, and domestic relations. Be empathetic but professional.'
  },
  {
    id: 'property',
    title: 'Real Estate',
    description: 'Property disputes, leases, buying/selling, and zoning.',
    icon: <Home className="w-6 h-6" />,
    color: 'bg-green-500',
    systemPrompt: 'You are an expert Real Estate Lawyer. Assist with property transactions, landlord-tenant disputes, zoning, and leases.'
  },
  {
    id: 'ip',
    title: 'Intellectual Property',
    description: 'Patents, trademarks, copyrights, and trade secrets.',
    icon: <Copyright className="w-6 h-6" />,
    color: 'bg-purple-500',
    systemPrompt: 'You are an expert IP Lawyer. Advise on patents, trademarks, copyrights, and protecting intellectual property rights.'
  },
  {
    id: 'immigration',
    title: 'Immigration',
    description: 'Visas, citizenship, asylum, and deportation defense.',
    icon: <Globe className="w-6 h-6" />,
    color: 'bg-orange-500',
    systemPrompt: 'You are an expert Immigration Lawyer. Provide information on visas, green cards, citizenship, and asylum processes.'
  },
  {
    id: 'civil',
    title: 'Civil Litigation',
    description: 'Lawsuits, damages, personal injury, and disputes.',
    icon: <Scale className="w-6 h-6" />,
    color: 'bg-indigo-500',
    systemPrompt: 'You are an expert Civil Litigation Lawyer. Assist with lawsuits, personal injury claims, and dispute resolution.'
  },
  {
    id: 'general',
    title: 'General Counsel',
    description: 'General legal advice and guidance on various topics.',
    icon: <Gavel className="w-6 h-6" />,
    color: 'bg-slate-500',
    systemPrompt: 'You are a General Legal Counsel AI. Provide broad legal information and guidance across various legal domains.'
  }
];

interface RoleSelectionProps {
  onSelectRole: (role: LawyerRole) => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole }) => {
  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-foreground mb-3">
          Select Your AI Legal Counsel
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose a specialized AI lawyer to discuss your specific legal situation. 
          Each assistant is trained in its respective field to provide relevant information.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {LAWYER_ROLES.map((role, index) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => onSelectRole(role)}
            className="bg-card hover:bg-accent/50 border border-border rounded-xl p-6 cursor-pointer shadow-sm hover:shadow-md transition-all group"
          >
            <div className={`w-12 h-12 rounded-lg ${role.color} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <div className={`${role.color.replace('bg-', 'text-')}`}>
                {role.icon}
              </div>
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-2">
              {role.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {role.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RoleSelection;
