const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add hook import at top
if (!content.includes('useAppData')) {
  // Find last import
  const lastImportIndex = content.lastIndexOf('import ');
  const endOfLastImport = content.indexOf('\n', lastImportIndex);
  content = content.slice(0, endOfLastImport + 1) + 
    "import { useAppData } from '../hooks/useAppData';\nimport { supabase } from '../lib/supabase';\n" + 
    content.slice(endOfLastImport + 1);
}

// 2. Erase the big initialization blocks for items, eventos, clientes, pesos, appSettings
const startItems = content.indexOf("const [items, setItems] = useState(() => {");
const endItemsPattern = "});\n\n  // UI States";
const uiStatesIndex = content.indexOf("// UI States");

if (startItems !== -1 && uiStatesIndex !== -1) {
  const replacement = `const {
    items, setItems,
    eventos, setEventos,
    clientes, setClientes,
    pesos, setPesos,
    appSettings, setAppSettings,
    eventSettings, setEventSettings,
    realInventoryItems, setRealInventoryItems,
    loading
  } = useAppData();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-slate-500">Cargando datos del sistema...</div>;
  }
`;
  content = content.substring(0, startItems) + replacement + "\n  // UI States" + content.substring(uiStatesIndex + 12);
}

// 3. Remove realInventoryItems state
const startRealInv = content.indexOf("const [realInventoryItems, setRealInventoryItems] = useState(() => {");
const endRealInvPattern = "return REAL_INVENTORY_INITIAL;\n  });";
const endRealInv = content.indexOf(endRealInvPattern) + endRealInvPattern.length;
if (startRealInv !== -1) {
  content = content.substring(0, startRealInv) + content.substring(endRealInv);
}

// 4. Remove eventSettings state
const startEvtSet = content.indexOf("const [eventSettings, setEventSettings] = useState(() => {");
const endEvtSetPattern = "return saved ? JSON.parse(saved) : DEFAULT_EVENT_SETTINGS;\n  });";
const endEvtSet = content.indexOf(endEvtSetPattern) + endEvtSetPattern.length;
if (startEvtSet !== -1) {
  content = content.substring(0, startEvtSet) + content.substring(endEvtSet);
}

// 5. Remove eventForm duplicated appSettings & sliderValues states which are mixed up?
// Wait, eventForm is just state, it's fine to leave it.
// appSettings state? We wiped it above if it was between items and UI states. Actually appSettings is AFTER eventForm!
// Let's do regex for appSettings
const startAppSettings = content.indexOf("const [appSettings, setAppSettings] = useState(() => {");
if (startAppSettings !== -1) {
  const endAppSettings = content.indexOf("});", startAppSettings) + 3;
  content = content.substring(0, startAppSettings) + content.substring(endAppSettings);
}

// 6. Delete all persistence useEffects
const persistenceRegex = /\/\/ Persistencia\s+(useEffect\(\(\) => \{ localStorage\.setItem[^\n]+\n)+/g;
content = content.replace(persistenceRegex, '// Se removió persistencia local de localStorage\n');
content = content.replace(/useEffect\(\(\) => \{ localStorage\.setItem\('wedding_real_inventory_v2', JSON\.stringify\(realInventoryItems\)\); \}, \[realInventoryItems\]\);/, '');

// 7. Remove 'eventSettings' local persistence
content = content.replace(/localStorage\.setItem\('eventSettings', JSON\.stringify\(newSettings\)\);/g, '');

fs.writeFileSync(filePath, content);
console.log('Migration step 1 complete');
