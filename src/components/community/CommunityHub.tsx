import React, { useState } from 'react';
import RoleSelection, { LawyerRole } from './RoleSelection';
import LawyerChat from './LawyerChat';
import { motion, AnimatePresence } from 'framer-motion';

const CommunityHub: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<LawyerRole | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnimatePresence mode="wait">
        {!selectedRole ? (
          <motion.div
            key="selection"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <RoleSelection onSelectRole={setSelectedRole} />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <LawyerChat 
              role={selectedRole} 
              onBack={() => setSelectedRole(null)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunityHub;
