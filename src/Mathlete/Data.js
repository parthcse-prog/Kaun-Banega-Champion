export const MATERIALS = {
  wood: { name: 'Wood', yieldStrength: 40, density: 600, color: '#b45309' },       // MPa, kg/m^3
  aluminum: { name: 'Aluminum', yieldStrength: 275, density: 2700, color: '#94a3b8' },
  steel: { name: 'Steel', yieldStrength: 250, density: 7850, color: '#475569' },
  titanium: { name: 'Titanium', yieldStrength: 830, density: 4500, color: '#d946ef' }
};

export const CHALLENGES = [
  {
    id: 'CIVIL_BEAM_01',
    branch: 'CIVIL',
    title: 'BUILD A SAFE STRUCTURE',
    objective: 'Design a beam capable of safely carrying a 5000 kg load.',
    optimizationTarget: 'MINIMUM MASS',
    visualizerType: 'BEAM',
    parameters: [
      { id: 'material', label: 'Material', type: 'SELECT', options: ['wood', 'aluminum', 'steel', 'titanium'], default: 'wood' },
      { id: 'length', label: 'Beam Length (m)', type: 'SLIDER', min: 2, max: 10, step: 0.5, default: 5 },
      { id: 'thickness', label: 'Thickness (cm)', type: 'SLIDER', min: 5, max: 50, step: 1, default: 10 }
    ],
    simulate: (inputs) => {
      const mat = MATERIALS[inputs.material];
      const lengthM = inputs.length;
      const thickM = inputs.thickness / 100; 
      const widthM = 0.2; 
      const loadKg = 5000;
      
      const volume = lengthM * thickM * widthM;
      const mass = volume * mat.density;
      const totalForce = (loadKg + mass) * 9.81; 
      const maxMoment = (totalForce * lengthM) / 4; 
      const sectionModulus = (widthM * Math.pow(thickM, 2)) / 6; 
      const maxStressPa = maxMoment / sectionModulus;
      const maxStressMPa = maxStressPa / 1000000;
      const safetyFactor = mat.yieldStrength / maxStressMPa;
      
      const isSuccess = safetyFactor >= 1.5;
      
      return {
        outputs: {
          'Load': `${loadKg} kg`,
          'Max Stress': `${maxStressMPa.toFixed(1)} MPa`,
          'Safety Factor': safetyFactor.toFixed(2),
          'Total Mass': `${Math.round(mass)} kg`
        },
        isSuccess,
        failureReason: isSuccess ? null : safetyFactor < 1.0 ? 'Beam fractured! Stress exceeded yield strength.' : 'Safety Factor too low! Minimum required is 1.5.',
        optimizationScore: mass
      };
    }
  },
  {
    id: 'MECH_GEAR_01',
    branch: 'MECHANICAL',
    title: 'EFFICIENT GEAR TRAIN',
    objective: 'Transfer power to lift a heavy load using the most efficient gear combination.',
    optimizationTarget: 'MAXIMUM EFFICIENCY',
    visualizerType: 'GEAR',
    parameters: [
      { id: 'motorRpm', label: 'Motor Speed (RPM)', type: 'SLIDER', min: 100, max: 3000, step: 100, default: 1000 },
      { id: 'gearA', label: 'Driving Gear Teeth', type: 'SLIDER', min: 10, max: 100, step: 5, default: 20 },
      { id: 'gearB', label: 'Driven Gear Teeth', type: 'SLIDER', min: 10, max: 100, step: 5, default: 50 },
      { id: 'lubricant', label: 'Lubricant Quality', type: 'SELECT', options: ['poor', 'standard', 'synthetic'], default: 'standard' }
    ],
    simulate: (inputs) => {
      const gearRatio = inputs.gearB / inputs.gearA;
      const outputRpm = inputs.motorRpm / gearRatio;
      
      // Friction loss based on RPM and lubricant
      let frictionCoeff = 0.15;
      if (inputs.lubricant === 'standard') frictionCoeff = 0.08;
      if (inputs.lubricant === 'synthetic') frictionCoeff = 0.03;
      
      // High RPM causes exponential friction loss
      const heatLoss = Math.pow(inputs.motorRpm / 1000, 1.2) * frictionCoeff;
      let efficiency = 100 - (heatLoss * 100);
      if (efficiency < 0) efficiency = 0;
      
      const isSuccess = outputRpm >= 200 && outputRpm <= 500 && efficiency > 60;
      
      return {
        outputs: {
          'Gear Ratio': `${gearRatio.toFixed(2)}:1`,
          'Output Speed': `${Math.round(outputRpm)} RPM`,
          'Heat Loss': `${Math.round(heatLoss * 100)} %`,
          'Efficiency': `${efficiency.toFixed(1)} %`
        },
        isSuccess,
        failureReason: isSuccess ? null : outputRpm < 200 ? 'Output RPM too slow to lift the load.' : outputRpm > 500 ? 'Output RPM too fast! Mechanism vibrating violently.' : 'Efficiency too low. System overheating.',
        optimizationScore: -efficiency // Lower is better for the generic engine, so we negate efficiency
      };
    }
  },
  {
    id: 'CSE_ALGO_01',
    branch: 'CSE',
    title: 'PROCESS 10 MILLION RECORDS',
    objective: 'Configure the data pipeline to process 10 million user records within 50ms without crashing the memory.',
    optimizationTarget: 'MINIMUM EXECUTION TIME',
    visualizerType: 'ALGORITHM',
    parameters: [
      { id: 'dataStructure', label: 'Data Structure', type: 'SELECT', options: ['array', 'linked_list', 'hash_map', 'b_tree'], default: 'array' },
      { id: 'threads', label: 'Worker Threads', type: 'SLIDER', min: 1, max: 16, step: 1, default: 1 },
      { id: 'caching', label: 'Cache Strategy', type: 'SELECT', options: ['none', 'lru', 'redis'], default: 'none' }
    ],
    simulate: (inputs) => {
      const baseTime = { 'array': 300, 'linked_list': 800, 'hash_map': 80, 'b_tree': 120 }[inputs.dataStructure];
      const memCost = { 'array': 40, 'linked_list': 120, 'hash_map': 250, 'b_tree': 180 }[inputs.dataStructure]; // MB
      
      let execTime = baseTime / Math.sqrt(inputs.threads); // Amdahl's law approximation
      let totalMem = memCost + (inputs.threads * 15);
      
      if (inputs.caching === 'lru') {
        execTime *= 0.6;
        totalMem += 100;
      } else if (inputs.caching === 'redis') {
        execTime *= 0.3;
        totalMem += 500;
      }
      
      const isSuccess = execTime <= 50 && totalMem <= 512;
      
      return {
        outputs: {
          'Target Time': '50 ms',
          'Target Mem': '512 MB',
          'Exec Time': `${Math.round(execTime)} ms`,
          'Memory Used': `${Math.round(totalMem)} MB`
        },
        isSuccess,
        failureReason: isSuccess ? null : execTime > 50 ? 'Execution too slow! Timeout error.' : 'Memory limit exceeded! OutOfMemoryException crashed the server.',
        optimizationScore: execTime
      };
    }
  }
];
