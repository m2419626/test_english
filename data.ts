
import { ExamSection, QuestionType } from './types';

export const JAE_ENGLISH_2025: ExamSection[] = [
  {
    id: 'section-1',
    title: 'Section 1 – Language Use',
    subtitle: '40 marks',
    parts: [
      {
        id: 's1-part-a-1',
        title: 'Part A – Vocabulary and grammar (Everyday conversation)',
        passage: `Lisa: Hi, Kenneth.\nKenneth: Hi, Lisa. It’s been ages since I (1) ________ saw you.\nLisa: It must be a year.\nKenneth: Yeah. How are you?\nLisa: I’m very (2) ________, thanks. Really busy. I am in the school basketball team now.\nKenneth: Yeah, I heard you guys are doing great.\nLisa: Thanks.\nKenneth: Are you still (3) ________ in Hong Kong?\nLisa: Yes, I am, but I’m in a new school now. It’s in a good location so I’m really (4) ________ it.\nKenneth: Great.`,
        questions: [
          { id: 'q1', number: 1, type: 'MCQ', options: [{label:'A', text:'previous'}, {label:'B', text:'before'}, {label:'C', text:'last'}, {label:'D', text:'after'}], correctAnswer: 'C', marks: 1 },
          { id: 'q2', number: 2, type: 'MCQ', options: [{label:'A', text:'fine'}, {label:'B', text:'true'}, {label:'C', text:'positively'}, {label:'D', text:'well'}], correctAnswer: 'D', marks: 1 },
          { id: 'q3', number: 3, type: 'MCQ', options: [{label:'A', text:'live'}, {label:'B', text:'studying'}, {label:'C', text:'be'}, {label:'D', text:'continue'}], correctAnswer: 'B', marks: 1 },
          { id: 'q4', number: 4, type: 'MCQ', options: [{label:'A', text:'enjoying'}, {label:'B', text:'delighting'}, {label:'C', text:'pleased'}, {label:'D', text:'joy'}], correctAnswer: 'A', marks: 1 },
        ]
      },
      {
        id: 's1-part-a-2',
        title: 'Part A – Vocabulary and grammar (A notice)',
        passage: `TOUR GUIDE NEEDED: WORK WITH ENGLISH-SPEAKING TOURISTS\nHave you (5) ________ looking for a chance to improve your English and earn some money at the same time? Well, here is how!\nOur company provides package tours for British and American tourists all (6) ________ the world, and we are looking for local people who are interested in acting as tour guides. You would be (7) ________ looking after your group and telling them stories about Macao.\nSend us (8) ________ email at Tours@Britamtours.com if you are interested.`,
        questions: [
          { id: 'q5', number: 5, type: 'MCQ', options: [{label:'A', text:'are'}, {label:'B', text:'being'}, {label:'C', text:'were'}, {label:'D', text:'been'}], correctAnswer: 'D', marks: 1 },
          { id: 'q6', number: 6, type: 'MCQ', options: [{label:'A', text:'over'}, {label:'B', text:'in'}, {label:'C', text:'about'}, {label:'D', text:'of'}], correctAnswer: 'A', marks: 1 },
          { id: 'q7', number: 7, type: 'MCQ', options: [{label:'A', text:'in charge'}, {label:'B', text:'responsible for'}, {label:'C', text:'accountable'}, {label:'D', text:'take care'}], correctAnswer: 'B', marks: 1 },
          { id: 'q8', number: 8, type: 'MCQ', options: [{label:'A', text:'an'}, {label:'B', text:'the'}, {label:'C', text:'some'}, {label:'D', text:'a'}], correctAnswer: 'A', marks: 1 },
        ]
      },
      {
        id: 's1-part-b',
        title: 'Part B – Spotting errors in context',
        passage: `Living in the city without a car\nMy name is Bob and I don’t have a car. Living without a car in a developed city is (1) possible but it is sometimes inconvenient. Without a car or motorbike, it can be a challenge to live in a large, spread-out city, but it is (2) very easier to live without a vehicle in a small city like Macao. Public transportation is obviously really important for people without a car because we need (3) them to get around. Travelling to work or school every day on a bus or a train can take a lot of time, especially (4) at the morning and evening rush hours. However, (5) take the bus is a lot less stressful than driving a car. Some active people who don’t have cars choose to walk or ride a bike to work in the mornings to (6) make some exercise. One of the biggest (7) hurts of living without a car is shopping. A lot of things I buy have to (8) be delivered because they are too heavy for me to transport them myself. I also can’t easily go to stores that are far away (9) that where I live. At the moment, I am happy living without a car but I might (10) buy one next year.`,
        questions: [
          { id: 'qb1', number: 1, type: 'MCQ', questionText: "Is '(1) possible' correct?", options: [{label:'A', text:'impossible'}, {label:'B', text:'possibly'}, {label:'C', text:'possibility'}, {label:'D', text:'NO CHANGE'}], correctAnswer: 'D', marks: 1.5 },
          { id: 'qb2', number: 2, type: 'MCQ', questionText: "Is '(2) very' correct?", options: [{label:'A', text:'mostly'}, {label:'B', text:'much'}, {label:'C', text:'a lot of'}, {label:'D', text:'NO CHANGE'}], correctAnswer: 'B', marks: 1.5 },
          { id: 'qb3', number: 3, type: 'MCQ', questionText: "Is '(3) them' correct?", options: [{label:'A', text:'it'}, {label:'B', text:'they'}, {label:'C', text:'him'}, {label:'D', text:'NO CHANGE'}], correctAnswer: 'A', marks: 1.5 },
          { id: 'qb4', number: 4, type: 'MCQ', questionText: "Is '(4) at' correct?", options: [{label:'A', text:'on'}, {label:'B', text:'during'}, {label:'C', text:'with'}, {label:'D', text:'NO CHANGE'}], correctAnswer: 'B', marks: 1.5 },
          { id: 'qb5', number: 5, type: 'MCQ', questionText: "Is '(5) take' correct?", options: [{label:'A', text:'taked'}, {label:'B', text:'took'}, {label:'C', text:'taking'}, {label:'D', text:'NO CHANGE'}], correctAnswer: 'C', marks: 1.5 },
        ]
      },
      {
        id: 's1-part-c',
        title: 'Part C – Joining sentences',
        passage: `The Internet Men: (1) Many people do not have Internet access in Bangladesh. In Bangladesh, Internet Men ride bicycles door-to-door to connect villages by Internet. (2) They carry laptops. Villagers can use the laptops for either personal or business use. (3) In many places, there are no doctors for miles. Deaths from easily curable diseases are common. (4) The Internet Men are also responsible for taking blood pressure and blood sugar levels. Taking blood pressure and blood sugar level measurements can save lives. (5) The country’s central bank has created a special fund to support the Internet Men. The country’s central bank will hire thousands more Internet Men in the next few years.`,
        questions: [
          { id: 'qc1', number: 1, type: 'MCQ', questionText: "Choose the best joined sentence for pair (1):", options: [
            {label:'A', text:'Many people do not have internet access in Bangladesh since Internet Men ride bicycles door-to-door...'},
            {label:'B', text:'Since many people do not have Internet access in Bangladesh, Internet Men ride bicycles door-to-door to connect villages by Internet there.'},
            {label:'C', text:'Since many people do not have Internet access in Bangladesh, so in Bangladesh, Internet Men ride bicycles...'},
            {label:'D', text:'Since in Bangladesh Internet Men ride bicycles door-to-door to connect villages by Internet, so many people...'}
          ], correctAnswer: 'B', marks: 2 },
          { id: 'qc2', number: 2, type: 'MCQ', questionText: "Choose the best joined sentence for pair (2):", options: [
            {label:'A', text:'They carry laptops which villagers can use the laptops for either personal or business.'},
            {label:'B', text:'Villagers can use the laptops for either personal or business use which they carry.'},
            {label:'C', text:'Villagers can use the laptops which for either personal or business use, they carry.'},
            {label:'D', text:'They carry laptops, which villagers can use for either personal or business use.'}
          ], correctAnswer: 'D', marks: 2 },
        ]
      }
    ]
  },
  {
    id: 'section-2',
    title: 'Section 2 – Reading Comprehension',
    subtitle: '30 marks',
    parts: [
      {
        id: 's2-part-b',
        title: 'Part B – Short passage: Energy Drinks Can Be Dangerous',
        passage: `(1) School can make students feel tired... (2) Even though energy drinks may seem harmless, they can actually be dangerous. One can contains up to 29g of sugar (12%). Sugar releases dopamine. Caffeine keeps dopamine levels high by slowing it down leaving the brain... (3) When effects disappear, person feels tired. Energy drinks are not food and don't provide nutrition, just sugar... (5) Research says drinking a lot of caffeine leads to problems like high blood pressure or fast heartbeat...`,
        questions: [
          { id: 'r1', number: 1, type: 'MCQ', questionText: "According to the passage, why do young people buy energy drinks?", options: [{label:'A', text:'They feel tired from their busy schedule.'}, {label:'B', text:'They like the sweet taste.'}, {label:'C', text:'They follow the example of their friends.'}, {label:'D', text:'They are tired of school.'}], correctAnswer: 'A', marks: 1.5 },
          { id: 'r2', number: 2, type: 'MCQ', questionText: "What is the meaning of 'combination' as used in paragraph 2?", options: [{label:'A', text:'The password to open a lock'}, {label:'B', text:'Expensive chemicals'}, {label:'C', text:'A mixture of two or more things'}, {label:'D', text:'Joining with the body'}], correctAnswer: 'C', marks: 1.5 },
        ]
      },
      {
        id: 's2-part-c-summary',
        title: 'Part C – Summary',
        passage: `World Economic Forum – The Future of Jobs Report (2023)\n* New technologies will (0) create some new types of jobs.\n* Some job types (4) ______________ won’t be replaced by AI:\nJobs that won’t be replaced by AI | Reason(s)\n- social workers | requires human (5) ______________\n- stage performers | able to engage with an audience\n- politicians and business leaders | AI doesn’t have (6) ______________ abilities\n- (7) ______________ trades people | they work with their hands`,
        questions: [
          { id: 'sum4', number: 4, type: 'FILL', questionText: "Fill in blank (4) (One word from passage):", correctAnswer: 'probably', marks: 1 },
          { id: 'sum5', number: 5, type: 'FILL', questionText: "Fill in blank (5) (One word from passage):", correctAnswer: 'understanding', marks: 1 },
          { id: 'sum6', number: 6, type: 'FILL', questionText: "Fill in blank (6) (One word from passage):", correctAnswer: 'leadership', marks: 1 },
          { id: 'sum7', number: 7, type: 'FILL', questionText: "Fill in blank (7) (One word from passage):", correctAnswer: 'skilled', marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'section-3',
    title: 'Section 3 – Writing',
    subtitle: '30 marks',
    parts: [
      {
        id: 's3-writing',
        title: 'Writing Task',
        description: 'Choose ONE topic below and write an essay of at least 200 words.',
        passage: `1. Describe your favourite online content creator and why you like them.\n2. How can young people reduce their stress in everyday life?\n3. What are the advantages and disadvantages of exams to measure students’ abilities?`,
        questions: [
          { id: 'w1', number: 1, type: 'WRITING', questionText: "Write your essay here (min 200 words):", marks: 30 }
        ]
      }
    ]
  }
];
