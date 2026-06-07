import { Module } from './types';

export const INITIAL_MODULES_DATA: Module[] = [
  {
    id: 'm0',
    title: 'Orientation & Learning Studio Introduction',
    lessons: [
      {
        id: 'intro_overview',
        title: 'Platform Orientation & Chemical Plant Overview',
        duration: '5:00',
        completed: false,
        overview: 'Welcome to our Chemical Engineering Learning Studio! This 5-minute orientation video introduces the full web-based curriculum across our core subjects: (1) Thermodynamics II (Equations of state, Phase equilibrium, fugacity kinetics), (2) Chemical Reaction Engineering (CSTR/PFR sizing, stoichiometric conversion matrices), and (3) Heat Transfer Processes (Fourier composite conduction, convection boundary layer scales). Toggle the Control Panel to transition between the Live Interactive Simulation and the Camera Broadcast Feed to see a chemical process plant operating in real-time.',
        thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
        resources: [
          { id: 'intro_r1', name: 'Universal_Syllabus_Compendium.pdf', type: 'pdf', url: '#' },
          { id: 'intro_r2', name: 'Interactive_Plant_Twin_Spec.pdf', type: 'pdf', url: '#' }
        ],
        conceptCaptions: [
          { start: 0, end: 15, text: "Welcome to the Chemical Engineering Learning Studio! This 5-minute orientation video introduces our full web-based curriculum." },
          { start: 15, end: 40, text: "Operating behind this interactive classroom is our active digital-twin simulation modeling an industrial chemical process plant." },
          { start: 40, end: 70, text: "Course 1: Thermodynamics II. Here we master Equations of State, modeling pure phase compressibility and non-ideal binary mixture equilibrium." },
          { start: 70, end: 100, text: "We construct P-x-y and T-x-y dual graphs to analyze vapor-liquid transitions, calculating activity coefficients with Margules and NRTL models." },
          { start: 100, end: 130, text: "Course 2: Chemical Reaction Engineering. Today we size kinetics, contrasting mixed-flow CSTR stirrers with packed catalyst bed PFRs." },
          { start: 130, end: 160, text: "Observe the reactant concentrations change dynamically as products flow through our automated reactor loops." },
          { start: 160, end: 190, text: "Course 3: Heat Transfer Processes. We scale heat exchange loads, modeling conduction resistance and convection boundary layers." },
          { start: 190, end: 220, text: "Using Nusselt-Prandtl fluid correlations, we monitor real-time concentric-pipe counter-current thermal efficiencies." },
          { start: 220, end: 250, text: "All lessons are paired with multi-step solved homework walk-throughs, downloadable code modules, and PDF reference files." },
          { start: 250, end: 280, text: "You can toggle between the high fidelity Live Simulation and the real camera feed on the control panel at any time." },
          { start: 280, end: 300, text: "Welcome aboard! Let's embark on our masterclass and start learning. Go ahead and select Module 1 to begin!" }
        ],
        solvedTitle: 'Solved Walkthrough: Concept Integration Examples',
        solvedDuration: '5:00',
        solvedOverview: 'A masterclass walkthrough of the overall curriculum concepts. We look at how PVT equations of state feed calculations in reactor sizing and thermal heat exchange cycles within an integrated chemical refinery plant.',
        solvedThumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
        solvedResources: [
          { id: 'intro_s1', name: 'Integrated_Unit_Operations_Problems.pdf', type: 'pdf', url: '#' }
        ],
        solvedCaptions: [
          { start: 0, end: 15, text: "Welcome back! In this solved walkthrough, we connect all three core subjects in our active chemical plant." },
          { start: 15, end: 40, text: "We trace how non-ideal VLE fugacity calculations impact safe pressure operating limits inside a continuous stirred tank reactor." },
          { start: 40, end: 80, text: "Next, we size the reactor's concentric heating jacket to satisfy heat transfer balance using forced convection correlations." },
          { start: 80, end: 120, text: "Notice how thermodynamic values, reaction rates, and convective heat loads work in unison to stabilize production." },
          { start: 120, end: 300, text: "Use this integrated approach to master your exam questions easily. Now click on the first lecture of Module 1 to begin!" }
        ]
      }
    ]
  },
  {
    id: 'm1',
    title: 'Module 1: Equations of State & Pure Phases',
    lessons: [
      {
        id: 'l1_1',
        title: 'Introduction to PVT Behavior & Pure Fluids',
        duration: '11:53',
        completed: true,
        overview: 'This lecture covers the fundamental PVT behavior of pure fluids, volumetric properties, critical phenomena, and the principle of corresponding states. We review general deviation behavior from ideal gas assumptions and model compressibility factors.',
        thumbnail: '/src/assets/images/teacher_react_lesson_1780368326324.png',
        resources: [
          { id: 'r1', name: 'Fluid_PVT_Notes.pdf', type: 'pdf', url: '#' },
          { id: 'r2', name: 'Equation_of_State_Syllabus.pdf', type: 'pdf', url: '#' }
        ],
        // Solved Questions representation fields
        solvedTitle: 'Pure Fluids: Multi-Step General Variable State Solution',
        solvedDuration: '13:40',
        solvedOverview: 'Step-by-step numerical solutions of high-yield practice questions:\n\n• Problem 1: Compute compressibility factor Z for carbon dioxide (CO2) at 350 K and 50 bar using the corresponding states principle.\n• Problem 2: Determine superheated steam specific volume given temperature and pressure using tabular steam charts.',
        solvedThumbnail: '/src/assets/images/teacher_react_lesson_1780368326324.png',
        solvedResources: [
          { id: 's1_1', name: 'PVT_Volumetric_Solved_Problems.pdf', type: 'pdf', url: '#' },
          { id: 's1_1_key', name: 'Steam_Lookup_Methodology.pdf', type: 'pdf', url: '#' }
        ],
        solvedCaptions: [
          { start: 0, end: 4, text: "Welcome back! Today we are working on solved questions for PVT behavior and pure fluids." },
          { start: 4, end: 12, text: "Let's calculate for CO2. Critical temperature is 304.2 Kelvin, critical pressure is 73.8 bar." },
          { start: 12, end: 22, text: "Calculate reduced conditions: Tr = T/Tc = 1.15, Pr = P/Pc = 0.68. Now locate these coordinates on the generalized chart." },
          { start: 22, end: 32, text: "Reading the value, we get a compressibility factor Z = 0.81." },
          { start: 32, end: 42, text: "Now let's compute steam superheat molar volume step-by-step using steam tables." }
        ]
      },
      {
        id: 'l1_2',
        title: 'Solving Cubic EOS: Peng-Robinson vs. SRK',
        duration: '18:45',
        completed: true,
        overview: 'A deep comparative analysis of modern cubic equations of state. You will learn to formulate parameter attractions, solve volume roots analytically or through numerical Newton-Raphson solvers, and compute vapor pressures with high accuracy.',
        thumbnail: '/src/assets/images/teacher_react_lesson_1780368326324.png',
        resources: [
          { id: 'r3', name: 'Peng_Robinson_Solver_Code.zip', type: 'zip', url: '#' }
        ],
        // Solved Questions representation fields
        solvedTitle: 'Step-by-Step Solver: PR and SRK Parameters & Volume Roots',
        solvedDuration: '19:15',
        solvedOverview: 'Numerical walkthroughs of cubic equations:\n\n• Problem 1: Systematically set up attraction parameters (a, b, alpha) for propane under high pressure vapor-liquid boundaries.\n• Problem 2: Formulate state equations in compressibility polynomial form and calculate maximum non-ideal deviations.',
        solvedThumbnail: '/src/assets/images/teacher_react_lesson_1780368326324.png',
        solvedResources: [
          { id: 's1_2', name: 'Cubic_EOS_Matrix_Solvers.pdf', type: 'pdf', url: '#' },
          { id: 's1_2_py', name: 'Newton_Raphson_EOS_Solver.zip', type: 'zip', url: '#' }
        ],
        solvedCaptions: [
          { start: 0, end: 5, text: "In this solved questions walkthrough, let's analytically compute cubic equation parameters." },
          { start: 5, end: 12, text: "We will establish alpha functions for propane using acentric factor correlations." },
          { start: 12, end: 20, text: "Now we formulate the cubic polynomial form of the Redlich-Kwong equation of state." },
          { start: 20, end: 30, text: "Let's perform a single Newton-Raphson iteration step to evaluate the liquid molar volume root." }
        ]
      }
    ]
  },
  {
    id: 'm2',
    title: 'Module 2: Mixture Vapor-Liquid Equilibrium (VLE)',
    lessons: [
      {
        id: 'l2_1',
        title: 'Formulating Phase Equilibrium & Raoult\'s Law',
        duration: '14:20',
        completed: true,
        overview: 'In this section, we study the thermodynamic criteria for multi-phase multi-component equilibrium using chemical potential equality. We introduce standard binary pressure-composition (P-x-y) and temperature-composition (T-x-y) diagrams representing ideal systems.',
        thumbnail: '/src/assets/images/teacher_react_lesson_1780368326324.png',
        resources: [
          { id: 'r4', name: 'Ideal_VLE_Phase_Diagrams.pdf', type: 'pdf', url: '#' },
          { id: 'r5', name: 'Binary_Calculations_Guide.pdf', type: 'pdf', url: '#' }
        ],
        // Solved Questions representation fields
        solvedTitle: 'Binary Mixture VLE: Solving P-x-y & T-x-y Equilibrium',
        solvedDuration: '15:30',
        solvedOverview: 'Systematic solutions of ideal binary phase mixtures:\n\n• Problem 1: Calculate the bubble point pressure and vapor composition (y1) of a benzene/toluene liquid system at 80°C.\n• Problem 2: Draw the qualitative dual T-x-y diagram showing subcooled liquids, superheated vapors, and phase fractions using the lever rule.',
        solvedThumbnail: '/src/assets/images/teacher_react_lesson_1780368326324.png',
        solvedResources: [
          { id: 's2_1', name: 'Benzene_Toluene_VLE_Solved.pdf', type: 'pdf', url: '#' }
        ],
        solvedCaptions: [
          { start: 0, end: 5, text: "Let's solve for benzene/toluene phase boundaries systematically." },
          { start: 5, end: 12, text: "We start by calculating vapor pressure using Antoine equations for both pure compounds." },
          { start: 12, end: 22, text: "Set up Raoult's expression: P = x1*P1_sat + (1-x1)*P2_sat. This gives us the bubble point line." },
          { start: 22, end: 30, text: "Applying Dalton's law: y1 = (x1 * P1_sat) / P. Vapor composition is enriched in volatile benzene." }
        ]
      },
      {
        id: 'l2_2',
        title: 'Non-Ideal Systems & Activity Coefficient Models',
        duration: '22:15',
        completed: true,
        overview: 'Moving beyond ideal mixtures. Study excess Gibbs free energy definitions, Margules formulation, van Laar models, and non-random two-liquid (NRTL) expressions. Learn to determine system azeotropes and model activity coefficients from empirical data points.',
        thumbnail: '/src/assets/images/teacher_react_lesson_1780368326324.png',
        resources: [
          { id: 'r6', name: 'Activity_Coefficients_Lecture.pdf', type: 'pdf', url: '#' }
        ],
        // Solved Questions representation fields
        solvedTitle: 'Solving Margules & NRTL Excess Gibbs Parameters',
        solvedDuration: '23:10',
        solvedOverview: 'Non-ideal binary solutions:\n\n• Problem 1: Calculate Margules 1-parameter & 2-parameter variables from a given single experimental azeotrope coordinate.\n• Problem 2: Perform systematic bubble-temperature estimations under non-ideal modified Raoult assumptions.',
        solvedThumbnail: '/src/assets/images/teacher_react_lesson_1780368326324.png',
        solvedResources: [
          { id: 's2_2', name: 'Margules_Excess_Models_Handout.pdf', type: 'pdf', url: '#' }
        ],
        solvedCaptions: [
          { start: 0, end: 6, text: "This session solves excess Gibbs models. We fit activity parameters from azeotropic mixtures." },
          { start: 6, end: 14, text: "If we have an azeotrope, component activity coefficients are equal to pressure fractions." },
          { start: 14, end: 24, text: "Rearranging Margules equations lets us isolate parameters A_12 and A_21 analytically." },
          { start: 24, end: 32, text: "Done! Now we map these variables across the whole composition landscape." }
        ]
      },
      {
        id: 'l2_3',
        title: 'Fugacity Coefficients & High-Pressure VLE',
        duration: '25:46',
        completed: true,
        overview: 'Deep dive into high-pressure vapor-liquid calculations using the dual-fugacity formulation (phi-phi approach). We will examine partial molar properties, chemical species fugacity definitions under multi-phase pressures, and computational bubble/dew calculations.',
        thumbnail: '/src/assets/images/teacher_react_lesson_1780368326324.png',
        resources: [
          { id: 'r7', name: 'Fugacity_Dual_Formulation_Handout.pdf', type: 'pdf', url: '#' },
          { id: 'r8', name: 'VLE_HighPressure_NumericalSolver.zip', type: 'zip', url: '#' }
        ],
        // Solved Questions representation fields
        solvedTitle: 'Walkthrough: Computational High-Pressure Fugacity Vectors',
        solvedDuration: '26:50',
        solvedOverview: 'Calculating fugacities using high-pressure equations:\n\n• Problem 1: Develop the partial molar volume integral equations for calculating pure species chemical potential deviations.\n• Problem 2: Execute a systematic double loop bubble-point calculation algorithm using the Phi-Phi thermodynamic formulations.',
        solvedThumbnail: '/src/assets/images/teacher_react_lesson_1780368326324.png',
        solvedResources: [
          { id: 's2_3', name: 'Fugacity_Calculations_Guide.pdf', type: 'pdf', url: '#' },
          { id: 's2_3_loop', name: 'Phi_Phi_Bubble_Algorithm_Blueprint.zip', type: 'zip', url: '#' }
        ],
        solvedCaptions: [
          { start: 0, end: 5, text: "Today we formulate the dual fugacity approach at elevated system pressures." },
          { start: 5, end: 15, text: "We map the species equation: f_i_vapor = f_i_liquid, substituting phi_i_vapor and phi_i_liquid." },
          { start: 15, end: 25, text: "Let's perform a system test. Notice how non-idealities severely shift the critical transition point." }
        ]
      }
    ]
  },
  {
    id: 'm3',
    title: 'Module 3: Chemical Reaction Equilibria (Slides)',
    lessons: [
      {
        id: 'l3_1',
        title: 'Thermodynamics of Reaction Equilibrium',
        duration: '19:30',
        completed: false,
        overview: 'Analysis of equilibrium constants, standard Gibbs energy changes of reactions, and Le Chatelier principle adjustments. Download and follow along with the specific calculation slides for single and multi-reaction chemical processes.',
        thumbnail: '/src/assets/images/teacher_react_lesson_1780368326324.png',
        resources: [
          { id: 'r9', name: 'Chemical_Equilibria_Theory.pdf', type: 'pdf', url: '#' }
        ],
        // Solved Questions representation fields
        solvedTitle: 'Chemical Equilibrium: Multi-Reaction Conversion Solvers',
        solvedDuration: '21:05',
        solvedOverview: 'Step-by-step chemical reaction thermodynamics:\n\n• Problem 1: Calculate the equilibrium conversion factor for gas-phase methanol synthesis at 500 K and 30 bar.\n• Problem 2: Predict how reactor temperature elevations or inert gas additions affect thermal reaction quotients.',
        solvedThumbnail: '/src/assets/images/teacher_react_lesson_1780368326324.png',
        solvedResources: [
          { id: 's3_1', name: 'Chemical_Reaction_Syllabus_Solvers.pdf', type: 'pdf', url: '#' }
        ],
        solvedCaptions: [
          { start: 0, end: 5, text: "Let's solve for high-temperature gas-phase reaction conversions." },
          { start: 5, end: 15, text: "Calculate Standard Gibbs Change dG_rxn = -RT ln(K_eq). This yields our fundamental equilibrium value." },
          { start: 15, end: 25, text: "Substitute molar reaction coordinates into partial pressure components to solve conversion extent." }
        ]
      }
    ]
  },
  {
    id: 'm4',
    title: 'Module 4: Advanced Cycles & Power Efficiency',
    lessons: [
      {
        id: 'l4_1',
        title: 'Dynamic Rankine and Brayton Cycle Efficiency',
        duration: '21:50',
        completed: false,
        overview: 'Thermodynamic modeling for high-temperature turbine performance. We cover reheat modifications, regenerative feed-water heating, thermal limits, and real-world system losses to calculate absolute cycle efficiency.',
        thumbnail: '/src/assets/images/teacher_react_lesson_1780368326324.png',
        resources: [
          { id: 'r10', name: 'Power_Cycle_Efficiency_Analysis.pdf', type: 'pdf', url: '#' },
          { id: 'r11', name: 'Steam_Tables_Matlab_Interface.zip', type: 'zip', url: '#' }
        ],
        // Solved Questions representation fields
        solvedTitle: 'Rankine Cycle: Multi-Stage Efficiency walkthrough with Reheat',
        solvedDuration: '24:30',
        solvedOverview: 'Systematic power cycle thermal models solved step-by-step:\n\n• Problem 1: Solve steam enthalpies at all turbine entrance and exit states for a reheat thermal plant operating between condenser limits of 10 kPa and main boiler limits of 15 MPa.\n• Problem 2: Calculate overall thermodynamic thermal efficiency of the combined cycle turbine.',
        solvedThumbnail: '/src/assets/images/teacher_react_lesson_1780368326324.png',
        solvedResources: [
          { id: 's4_1', name: 'Reheat_Cycle_Enthalpy_Charts.pdf', type: 'pdf', url: '#' }
        ],
        solvedCaptions: [
          { start: 0, end: 6, text: "Let's perform a step-by-step thermodynamic analysis of a steam Rankine cycle." },
          { start: 6, end: 15, text: "Determine enthalpies (h) at superheated inlet State 1 and isentropic expansion State 2." },
          { start: 15, end: 25, text: "Include fractional reheater steps to yield absolute thermal efficiency enhancement." }
        ]
      }
    ]
  }
];

export const CRE_MODULES_DATA: Module[] = [
  {
    id: 'cre_m1',
    title: 'Module 1: Kinetics & Batch Reactors Sizing',
    lessons: [
      {
        id: 'cre_l1',
        title: 'Introduction to Reaction Kinetics & Molar Balance',
        duration: '13:10',
        completed: true,
        overview: 'This lecture reviews basic reaction kinetic laws, stoichiometry tables under variable density, and the integral/differential design equations for liquid-phase Batch configurations.',
        thumbnail: '/src/assets/images/teacher_react_lesson_1780368326324.png',
        resources: [
          { id: 'cre_r1', name: 'Batch_Kinetics_Review.pdf', type: 'pdf', url: '#' },
          { id: 'cre_r1_b', name: 'Stoichiometric_Conversion_Table.pdf', type: 'pdf', url: '#' }
        ],
        solvedTitle: 'Batch Reactor Conversion & First-Order Rate Constants',
        solvedDuration: '14:55',
        solvedOverview: 'Interactive numerical solution of a liquid batch system:\n\n• Problem 1: Integrate the reactor rates to calculate the total reaction time required to achieve 90% conversion of reactant A.\n• Problem 2: Evaluate the rate constant k under elevated temperature using the Arrhenius equation.',
        solvedThumbnail: '/src/assets/images/teacher_react_lesson_1780368326324.png',
        solvedResources: [
          { id: 'cre_s1', name: 'Batch_Reactor_StepByStep_Solved.pdf', type: 'pdf', url: '#' }
        ],
        solvedCaptions: [
          { start: 0, end: 5, text: "Welcome! Today we are solving design equations for batch reactors." },
          { start: 5, end: 15, text: "Let's state the reaction rate -rA = k * CA. Under variable composition, CA = CA0 * (1 - X)." },
          { start: 15, end: 25, text: "Integrating our sizing expression: t = CA0 * Integral( dX / -rA ) from 0 to 0.90 yields t = 2.3 / k." },
          { start: 25, end: 35, text: "Substituting our k = 0.05 min^-1, we get a total batch reaction run-time of 46 minutes." }
        ]
      }
    ]
  },
  {
    id: 'cre_m2',
    title: 'Module 2: Continuous Flow Reactors (CSTR vs. PFR)',
    lessons: [
      {
        id: 'cre_l2',
        title: 'Continuous Stirred Tank Reactors (CSTR)',
        duration: '15:40',
        completed: false,
        overview: 'Formulate the space-time volume design equation for continuous stirred tank flow reactors under steady-state operation. We analyze physical mixing parameters and outlet concentrations.',
        thumbnail: '/src/assets/images/teacher_react_lesson_1780368326324.png',
        resources: [
          { id: 'cre_r2', name: 'CSTR_Mixed_Flow_Sizing_Handout.pdf', type: 'pdf', url: '#' }
        ],
        solvedTitle: 'Comparing CSTR vs. PFR Sizing for Second-Order Yield',
        solvedDuration: '18:20',
        solvedOverview: 'Detailed kinetic comparison exercise:\n\n• Problem 1: Formulate CSTR and PFR size requirements to achieve the identical 85% conversion level for a second-order reaction.\n• Problem 2: Draw the Levenspiel Plot demonstrating spatial reactor efficiency.',
        solvedThumbnail: '/src/assets/images/teacher_react_lesson_1780368326324.png',
        solvedResources: [
          { id: 'cre_s2', name: 'CSTR_vs_PFR_Sizing_Compendium.pdf', type: 'pdf', url: '#' }
        ],
        solvedCaptions: [
          { start: 0, end: 6, text: "In this tutorial, we evaluate reactor volumes for a second-order reaction." },
          { start: 6, end: 15, text: "For second-order, CSTR volume V_CSTR = F0 * X / (k * CA0^2 * (1 - X)^2)." },
          { start: 15, end: 26, text: "PFR volume integration gives V_PFR = F0/k/CA0^2 * (X / (1-X)). Note how CSTR requires twice the PFR volume." }
        ]
      }
    ]
  }
];

export const HEAT_TRANSFER_MODULES_DATA: Module[] = [
  {
    id: 'ht_m1',
    title: 'Module 1: Conduction Heat Transfer Systems',
    lessons: [
      {
        id: 'ht_l1',
        title: "Fourier's Law & Steady 1D Conduction Planes",
        duration: '11:20',
        completed: false,
        overview: 'This lesson covers fundamental heat conduction models. We establish temperature profiles through composite planar wall layers and define thermal resistance networks.',
        thumbnail: '/src/assets/images/teacher_react_lesson_1780368326324.png',
        resources: [
          { id: 'ht_r1', name: 'Conduction_Convection_Basics.pdf', type: 'pdf', url: '#' }
        ],
        solvedTitle: 'Tutorial: Heat Conduction Through Multi-Layer Insulation',
        solvedDuration: '13:30',
        solvedOverview: 'Analytical composite material solutions:\n\n• Problem 1: Solve for heat loss flux (W/m2) through a triple-layer furnace refractory brick system with external convection boundaries.\n• Problem 2: Calculate specific interface temperatures to verify structural safety layers.',
        solvedThumbnail: '/src/assets/images/teacher_react_lesson_1780368326324.png',
        solvedResources: [
          { id: 'ht_s1', name: 'Composite_Brick_Insulation_Solved.pdf', type: 'pdf', url: '#' }
        ],
        solvedCaptions: [
          { start: 0, end: 5, text: "Today we calculate thermal performance of composite insulation." },
          { start: 5, end: 12, text: "Set up the resistance series: R_total = R1 + R2 + R3. Where R = L / (k * A)." },
          { start: 12, end: 22, text: "Heat rate Q = dT / R_total. Let's substitute thickness values and material conductivities." }
        ]
      }
    ]
  },
  {
    id: 'ht_m2',
    title: 'Module 2: Convective Boundary Layers & Nusselt Scales',
    lessons: [
      {
        id: 'ht_l2',
        title: 'Convective Heat Coefficients & Flat Plate Boundaries',
        duration: '16:12',
        completed: false,
        overview: 'Formulating physical local convective heat transfer coefficients using Nusselt correlations. Evaluating Prandtl and laminar flat-plate Reynolds bounds.',
        thumbnail: '/src/assets/images/teacher_react_lesson_1780368326324.png',
        resources: [
          { id: 'ht_r2', name: 'Nusselt_Correlations_Table.pdf', type: 'pdf', url: '#' }
        ],
        solvedTitle: 'Convection Heat Removal Over Flat Panels',
        solvedDuration: '17:40',
        solvedOverview: 'Systemic calculation of active fluid cooling:\n\n• Problem 1: Compute average convection coefficients for wind blowing at 5 m/s across heated solar collector panels.\n• Problem 2: Solve the total cooling rate in Watts utilizing fluid thermal layer approximations.',
        solvedThumbnail: '/src/assets/images/teacher_react_lesson_1780368326324.png',
        solvedResources: [
          { id: 'ht_s2', name: 'Forced_Convection_Solar_Sizing.pdf', type: 'pdf', url: '#' }
        ],
        solvedCaptions: [
          { start: 0, end: 5, text: "Let's calculate wind cooling on rectangular plates." },
          { start: 5, end: 12, text: "First, compute the Reynolds number Re = rho * V * L / mu to verify if the flow is laminar." },
          { start: 12, end: 22, text: "Using the correlation Nu = 0.664 * Re^0.5 * Pr^0.33 to find the average heat transfer coefficient h." }
        ]
      }
    ]
  }
];

export const INITIAL_COURSES: { [courseId: string]: { title: string; modules: Module[] } } = {
  'thermo-ii': {
    title: 'Thermodynamics II',
    modules: INITIAL_MODULES_DATA
  },
  'cre': {
    title: 'Chemical Reaction Engineering (CRE)',
    modules: CRE_MODULES_DATA
  },
  'heat-transfer': {
    title: 'Heat Transfer Processes',
    modules: HEAT_TRANSFER_MODULES_DATA
  }
};

export const INITIAL_MODULES: Module[] = INITIAL_MODULES_DATA;
