const fs = require('fs');
const filepath = 'src/components/DealPipeline.jsx';
let content = fs.readFileSync(filepath, 'utf-8');

// Needs useCallback for the functions passed to DealCard to avoid unnecessary re-renders
const oldFns = `  const toggleAlert = (simId) => {
    setSimulations(prev => prev.map(s => {
      if (s.id === simId) {
        const isEnabling = !s.hasAlert;
        if (isEnabling) {
          alert(\`Alerte activée pour "\${s.name}". Vous serez notifié si le prix baisse ou dans 45 jours.\`);
        }
        return { ...s, hasAlert: isEnabling };
      }
      return s;
    }));
  };

  const changeStatus = (simId, currentIndex, direction) => {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < COLUMNS.length) {
      const newStatus = COLUMNS[newIndex].id;
      setSimulations(prev => prev.map(s => s.id === simId ? { ...s, pipelineStatus: newStatus } : s));
    }
  };

  const openSimulation = (id) => {
    setActiveSimId(id);
    setViewMode('dashboard');
  };`;

const newFns = `  const toggleAlert = React.useCallback((simId) => {
    setSimulations(prev => prev.map(s => {
      if (s.id === simId) {
        const isEnabling = !s.hasAlert;
        if (isEnabling) {
          alert(\`Alerte activée pour "\${s.name}". Vous serez notifié si le prix baisse ou dans 45 jours.\`);
        }
        return { ...s, hasAlert: isEnabling };
      }
      return s;
    }));
  }, [setSimulations]);

  const changeStatus = React.useCallback((simId, currentIndex, direction) => {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < COLUMNS.length) {
      const newStatus = COLUMNS[newIndex].id;
      setSimulations(prev => prev.map(s => s.id === simId ? { ...s, pipelineStatus: newStatus } : s));
    }
  }, [setSimulations]);

  const openSimulation = React.useCallback((id) => {
    setActiveSimId(id);
    setViewMode('dashboard');
  }, [setActiveSimId, setViewMode]);`;

content = content.replace(oldFns, newFns);

fs.writeFileSync(filepath, content, 'utf-8');
