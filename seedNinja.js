import fs from 'fs';
import { MongoClient } from 'mongodb';

const sem1Questions = [
  {
    "question_id": 55,
    "question": "Which application of integration is explicitly mentioned?",
    "options": [
      "Area and volume",
      "Password checking",
      "File parsing",
      "Pattern generation"
    ],
    "correct_answer": "Area and volume"
  },
  {
    "question_id": 56,
    "question": "Which type of differential equation is included in the syllabus?",
    "options": [
      "First-order first-degree",
      "Only third-order nonlinear",
      "Only partial differential equations",
      "Only algebraic equations"
    ],
    "correct_answer": "First-order first-degree"
  },
  {
    "question_id": 57,
    "question": "Which form of first-order differential equation is explicitly included?",
    "options": [
      "Separable",
      "Matrix-only",
      "Vector-only",
      "Polynomial-only"
    ],
    "correct_answer": "Separable"
  },
  {
    "question_id": 58,
    "question": "Which application is explicitly mentioned for first-order differential equations?",
    "options": [
      "Growth and decay",
      "String frequency counting",
      "File handling",
      "Laser diffraction"
    ],
    "correct_answer": "Growth and decay"
  },
  {
    "question_id": 59,
    "question": "Which second-order equations are included in the syllabus?",
    "options": [
      "Linear differential equations with constant coefficients",
      "Only first-order equations",
      "Only nonlinear PDEs",
      "Only integral equations"
    ],
    "correct_answer": "Linear differential equations with constant coefficients"
  },
  {
    "question_id": 60,
    "question": "Which software tools are mentioned for visual exploration of differential equations?",
    "options": [
      "GeoGebra and Desmos",
      "Jupyter and Colab only",
      "Photoshop and Illustrator",
      "Unity and Blender"
    ],
    "correct_answer": "GeoGebra and Desmos"
  },
  {
    "question_id": 61,
    "question": "Which topic is included in the Measurements, Vectors and Engineering Mechanics unit?",
    "options": [
      "Dimensional analysis",
      "CSV parsing",
      "Taylor series",
      "Recursion"
    ],
    "correct_answer": "Dimensional analysis"
  },
  {
    "question_id": 62,
    "question": "Which quantity has both magnitude and direction?",
    "options": [
      "Vector",
      "Scalar",
      "Unit only",
      "Constant only"
    ],
    "correct_answer": "Vector"
  },
  {
    "question_id": 63,
    "question": "Which law describes the relationship between force, mass, and acceleration?",
    "options": [
      "Newton's second law",
      "Newton's first law",
      "Newton's third law",
      "Coulomb's law"
    ],
    "correct_answer": "Newton's second law"
  },
  {
    "question_id": 64,
    "question": "Which quantities are explicitly included under engineering mechanics?",
    "options": [
      "Work, energy and power",
      "Radius and interval of convergence",
      "Files and exceptions",
      "Gamma and Beta functions"
    ],
    "correct_answer": "Work, energy and power"
  },
  {
    "question_id": 65,
    "question": "Which type of motion is central to the Simple Harmonic Motion unit?",
    "options": [
      "Oscillatory motion",
      "Only translational motion",
      "Only projectile motion",
      "Only rotational motion"
    ],
    "correct_answer": "Oscillatory motion"
  }
];

const sem3Questions = [
  {
    "question_id": 52,
    "question": "Which scheduling approach relies on fixed priorities?",
    "options": ["Priority scheduling", "FCFS", "Random scheduling", "Round Robin"],
    "correct_answer": "Priority scheduling"
  },
  {
    "question_id": 53,
    "question": "Which synchronization problem involves readers and writers sharing data?",
    "options": ["Readers-Writers problem", "Dining philosophers", "Producer-consumer", "Sleeping barber"],
    "correct_answer": "Readers-Writers problem"
  },
  {
    "question_id": 54,
    "question": "Which scheduling algorithm selects the task with the nearest deadline?",
    "options": ["EDF (Earliest Deadline First)", "FCFS", "Round Robin", "Priority"],
    "correct_answer": "EDF (Earliest Deadline First)"
  },
  {
    "question_id": 55,
    "question": "What is an anomaly where more frames lead to more page faults?",
    "options": ["Belady's anomaly", "Thrashing", "Deadlock", "Starvation"],
    "correct_answer": "Belady's anomaly"
  },
  {
    "question_id": 56,
    "question": "What does a directory structure typically organize?",
    "options": ["Files on a disk", "Network packets", "CPU registers", "I/O devices"],
    "correct_answer": "Files on a disk"
  },
  {
    "question_id": 57,
    "question": "What is a major advantage of contiguous memory allocation?",
    "options": ["Simple to implement", "Eliminates fragmentation completely", "Supports virtual memory natively", "Increases disk speed"],
    "correct_answer": "Simple to implement"
  },
  {
    "question_id": 58,
    "question": "What is a major disadvantage of contiguous memory allocation?",
    "options": ["External fragmentation", "Internal fragmentation", "Slow access", "Requires more registers"],
    "correct_answer": "External fragmentation"
  },
  {
    "question_id": 59,
    "question": "Which concept describes memory that is not contiguous and divided into frames?",
    "options": ["Paging", "Segmentation", "Contiguous allocation", "Direct mapping"],
    "correct_answer": "Paging"
  },
  {
    "question_id": 60,
    "question": "What does thrashing mean?",
    "options": ["System spends more time paging than executing", "Disk drive is physically damaged", "CPU is overheating", "Process is waiting for input"],
    "correct_answer": "System spends more time paging than executing"
  },
  {
    "question_id": 61,
    "question": "Which file access method reads data sequentially?",
    "options": ["Sequential access", "Direct access", "Random access", "Indexed access"],
    "correct_answer": "Sequential access"
  },
  {
    "question_id": 62,
    "question": "Which file access method allows reading records in any order?",
    "options": ["Direct access", "Sequential access", "Stream access", "Linear access"],
    "correct_answer": "Direct access"
  },
  {
    "question_id": 63,
    "question": "Which directory structure uses a single directory for all users?",
    "options": ["Single-level directory", "Two-level directory", "Tree-structured directory", "Acyclic-graph directory"],
    "correct_answer": "Single-level directory"
  },
  {
    "question_id": 64,
    "question": "Which directory structure assigns a separate directory for each user?",
    "options": ["Two-level directory", "Single-level directory", "Tree-structured directory", "Acyclic-graph directory"],
    "correct_answer": "Two-level directory"
  },
  {
    "question_id": 65,
    "question": "What is an I/O buffer used for?",
    "options": ["To accommodate speed mismatches between devices", "To store permanent files", "To replace main memory", "To control network routing"],
    "correct_answer": "To accommodate speed mismatches between devices"
  }
];

const sem5Questions = [
  {
    "question_id": 52,
    "question": "Which routing approach uses the shortest path algorithm to select routes?",
    "options": ["Shortest path routing", "Random routing", "Message routing", "Serial routing"],
    "correct_answer": "Shortest path routing"
  },
  {
    "question_id": 53,
    "question": "Which routing algorithm sends packets along all possible paths in a controlled manner?",
    "options": ["Flooding", "Token bucket", "Leaky bucket", "Circuit switching"],
    "correct_answer": "Flooding"
  },
  {
    "question_id": 54,
    "question": "Which routing algorithm maintains information about distances to destinations?",
    "options": ["Distance vector routing", "Flooding", "Circuit routing", "ALOHA"],
    "correct_answer": "Distance vector routing"
  },
  {
    "question_id": 55,
    "question": "Which routing algorithm builds a view of network topology using link-state information?",
    "options": ["Link state routing", "Simplex routing", "Packet switching", "Message switching"],
    "correct_answer": "Link state routing"
  },
  {
    "question_id": 56,
    "question": "Which principle is used in the analysis of routing algorithms to determine optimal paths?",
    "options": ["Optimality principle", "Parity principle", "Sampling principle", "Access principle"],
    "correct_answer": "Optimality principle"
  },
  {
    "question_id": 57,
    "question": "Which algorithm is used for traffic shaping by controlling the rate at which packets leave a network?",
    "options": ["Leaky bucket", "Shortest path", "Flooding", "Sliding window"],
    "correct_answer": "Leaky bucket"
  },
  {
    "question_id": 58,
    "question": "Which traffic-shaping algorithm uses tokens to regulate packet transmission?",
    "options": ["Token bucket", "Leaky bucket", "Distance vector", "ALOHA"],
    "correct_answer": "Token bucket"
  },
  {
    "question_id": 59,
    "question": "What does QoS generally refer to in networking?",
    "options": ["Quality of Service", "Quantity of Signals", "Queue of Switches", "Query of Systems"],
    "correct_answer": "Quality of Service"
  },
  {
    "question_id": 60,
    "question": "Which Internet Protocol version is introduced as an alternative to IPv4 in the syllabus?",
    "options": ["IPv6", "IPv5", "IPv7", "IPv9"],
    "correct_answer": "IPv6"
  },
  {
    "question_id": 61,
    "question": "Which device forwards packets between different networks?",
    "options": ["Router", "Hub", "Repeater", "Bridge only"],
    "correct_answer": "Router"
  },
  {
    "question_id": 62,
    "question": "Which device regenerates or amplifies signals to extend transmission distance?",
    "options": ["Repeater", "Router", "Gateway", "Firewall"],
    "correct_answer": "Repeater"
  },
  {
    "question_id": 63,
    "question": "Which transport protocol is connection-oriented?",
    "options": ["TCP", "UDP", "IP", "DNS"],
    "correct_answer": "TCP"
  },
  {
    "question_id": 64,
    "question": "Which transport protocol is connectionless?",
    "options": ["UDP", "TCP", "FTP", "HTTP"],
    "correct_answer": "UDP"
  },
  {
    "question_id": 65,
    "question": "Which application-layer service translates domain names into IP addresses?",
    "options": ["DNS", "FTP", "TCP", "HDLC"],
    "correct_answer": "DNS"
  }
];

const sem7Questions = [
  {
    "question_id": 52,
    "question": "Which cloud service model provides application software to users as a service?",
    "options": ["SaaS", "PaaS", "IaaS", "LAN"],
    "correct_answer": "SaaS"
  },
  {
    "question_id": 53,
    "question": "Which cloud service model provides a platform for application development and deployment?",
    "options": ["PaaS", "SaaS", "IaaS", "VPN"],
    "correct_answer": "PaaS"
  },
  {
    "question_id": 54,
    "question": "Which cloud service model provides infrastructure resources such as computing and storage?",
    "options": ["IaaS", "SaaS", "PaaS", "DNS"],
    "correct_answer": "IaaS"
  },
  {
    "question_id": 55,
    "question": "Which cloud deployment model is generally intended for use by the general public?",
    "options": ["Public cloud", "Private cloud", "Community cloud", "Hybrid cloud"],
    "correct_answer": "Public cloud"
  },
  {
    "question_id": 56,
    "question": "Which deployment model combines characteristics of more than one cloud environment?",
    "options": ["Hybrid cloud", "Private cloud", "Public cloud only", "Local cloud"],
    "correct_answer": "Hybrid cloud"
  },
  {
    "question_id": 57,
    "question": "What is SLA management concerned with?",
    "options": ["Managing agreed service-level commitments", "Writing source code only", "Designing CPU registers", "Creating test cases only"],
    "correct_answer": "Managing agreed service-level commitments"
  },
  {
    "question_id": 58,
    "question": "Which security concern is explicitly included in cloud computing?",
    "options": ["Data security", "Screen resolution", "Keyboard layout", "Source code indentation"],
    "correct_answer": "Data security"
  },
  {
    "question_id": 59,
    "question": "What does CDN stand for in cloud applications?",
    "options": ["Content Delivery Network", "Cloud Data Node", "Central Database Network", "Computer Deployment Node"],
    "correct_answer": "Content Delivery Network"
  },
  {
    "question_id": 60,
    "question": "Which cloud provider is explicitly mentioned in the syllabus for application architecture best practices?",
    "options": ["AWS", "Oracle only", "IBM only", "No provider is mentioned"],
    "correct_answer": "AWS"
  },
  {
    "question_id": 61,
    "question": "What is a key distinction between soft computing and hard computing?",
    "options": ["Soft computing can handle imprecision and uncertainty", "Soft computing never uses algorithms", "Hard computing cannot use logic", "Soft computing requires no computation"],
    "correct_answer": "Soft computing can handle imprecision and uncertainty"
  },
  {
    "question_id": 62,
    "question": "Which is identified as a major area of soft computing?",
    "options": ["Neural networks", "File systems", "Network cabling", "Database indexing only"],
    "correct_answer": "Neural networks"
  },
  {
    "question_id": 63,
    "question": "What is a perceptron?",
    "options": ["A basic artificial neuron model", "A file system", "A routing protocol", "A cloud deployment model"],
    "correct_answer": "A basic artificial neuron model"
  },
  {
    "question_id": 64,
    "question": "Which perceptron architecture is explicitly listed in the syllabus?",
    "options": ["Single Layer Perceptron", "Only convolutional network", "Only recurrent network", "Only decision tree"],
    "correct_answer": "Single Layer Perceptron"
  },
  {
    "question_id": 65,
    "question": "Which neural network has more than one layer of processing units?",
    "options": ["Multilayer Perceptron", "Single-layer perceptron", "Hopfield input only", "Instar only"],
    "correct_answer": "Multilayer Perceptron"
  }
];

const allData = {
  1: sem1Questions,
  3: sem3Questions,
  5: sem5Questions,
  7: sem7Questions
};

async function seedConceptNinja() {
  const uri = 'mongodb+srv://parthcse_db_user:e5T9QIbSX4JVDnpC@cluster0.jo12y4w.mongodb.net/?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('miet_games');
    
    for (const [sem, data] of Object.entries(allData)) {
      const formatted = data.map(q => {
        const distractors = q.options.filter(o => o !== q.correct_answer);
        const explanations = {};
        distractors.forEach(d => { explanations[d] = "Incorrect"; });
        
        return {
          id: `CSE_CN_SEM${sem}_${q.question_id}`,
          branch: "CSE",
          subject: `Semester ${sem}`,
          topic: "Mixed",
          questionText: q.question,
          correctConcepts: [q.correct_answer],
          distractors: distractors,
          explanations: explanations
        };
      });
      
      const collName = `concept_ninja_cs_sem${sem}`;
      await db.collection(collName).deleteMany({});
      if (formatted.length > 0) {
        await db.collection(collName).insertMany(formatted);
      }
      console.log(`Seeded ${formatted.length} questions into ${collName}`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

seedConceptNinja();
