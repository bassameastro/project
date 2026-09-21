import { AlgorithmSection, algorithmTopicInfo } from './sections/algorithms/algorithms.js';
import { DataStructuresSection, dataStructureTopicInfo } from './sections/data-structures/dataStructures.js';
import { CryptographySection, cryptographyTopicInfo } from './sections/cryptography/cryptography.js';
import { ComplexityVisualizer } from './components/complexityVisualizer.js';
import { caesarShiftText } from './logic/caesar.js';

const e = React.createElement;
const { useState, useEffect } = React;

const HOME_SECTIONS = [
  {
    id: 'data-structures',
    title: dataStructureTopicInfo.title,
    definition: 'Data structures are organized ways to store and manage data for efficient access, update, and retrieval.',
    className: 'home-card-data',
    flowClass: 'data-flow',
    flow: [
      { type: 'text', value: 'DATA STRUCTURES' },
      { type: 'machine', value: '01010100 01101001 01101110 01101001' },
      { type: 'ram' },
    ],
  },
  {
    id: 'algorithms',
    title: algorithmTopicInfo.title,
    definition: 'An algorithm is a step-by-step procedure used to solve a problem or complete a task efficiently.',
    className: 'home-card-algorithm',
    flowClass: 'algorithm-flow',
    flow: [{ type: 'text', value: 'PROBLEM' }, { type: 'machine', value: 'STEP 1' }, { type: 'machine', value: 'STEP 2' }, { type: 'machine', value: 'STEP 3' }, { type: 'text', value: 'SOLUTION' }],
  },
  {
    id: 'cryptography',
    title: cryptographyTopicInfo.title,
    definition: 'Cryptography is the practice of protecting information by encoding and decoding data securely.',
    className: 'home-card-crypto',
    flowClass: 'crypto-flow',
    flow: [{ type: 'text', value: 'TEXT' }, { type: 'machine', value: 'SECRET CODE' }, { type: 'cipher' }],
  },
];

const SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'data-structures', label: dataStructureTopicInfo.title },
  { id: 'algorithms', label: algorithmTopicInfo.title },
  { id: 'cryptography', label: cryptographyTopicInfo.title },
];

const App = () => {
  const [selectedSection, setSelectedSection] = useState('home');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  const sectionInfo = selectedSection === 'home'
    ? { title: 'Welcome', summary: 'Choose a topic to explore visualizations and algorithms.' }
    : selectedSection === 'data-structures'
      ? dataStructureTopicInfo
      : selectedSection === 'algorithms'
        ? algorithmTopicInfo
        : cryptographyTopicInfo;

  const renderSection = () => {
    if (selectedSection === 'data-structures') return e(DataStructuresSection);
    if (selectedSection === 'algorithms') return e(AlgorithmSection);
    if (selectedSection === 'cryptography') return e(CryptographySection);

    const renderFlow = (section) => e('div', { className: `home-card-flow ${section.flowClass}` }, section.flow.flatMap((step, index) => [
      ...(index > 0 ? [e('div', { key: `arrow-${index}`, className: `flow-arrow-row${step.type === 'cipher' ? ' crypto-arrow' : ''}` }, e('span', { className: 'flow-arrow' }, step.type === 'cipher' ? '↓' : '→'))] : []),
      step.type === 'ram'
        ? e('div', { key: `step-${index}`, className: 'flow-ram' }, e('span', { className: 'ram-top' }), e('span', { className: 'ram-body' }, e('span', { className: 'ram-row' }), e('span', { className: 'ram-row' }), e('span', { className: 'ram-row' })), e('span', { className: 'ram-label' }, 'RAM'))
        : e('div', { key: `step-${index}`, className: step.type === 'text' ? 'flow-text' : `flow-machine${step.type === 'cipher' ? ' crypto-cipher' : ''}` }, step.type === 'cipher' ? caesarShiftText('SECRET CODE', 7) : step.value),
    ]));

    const toHomeCard = (section) => {
      return e('div', {
        key: section.id,
        className: `overview-card home-card ${section.className}`,
        role: 'button',
        tabIndex: 0,
        onClick: () => setSelectedSection(section.id),
        onKeyDown: (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setSelectedSection(section.id);
          }
        },
      },
        e('h3', null, section.title),
        e('p', null, section.definition),
        renderFlow(section)
      );
    };

    return e('div', { className: 'home-content' },
      e('div', { className: 'home-grid' },
        HOME_SECTIONS.map(toHomeCard)
      ),
      e('div', { className: 'info-section' },
        e('h3', null, 'Why Do We Need Data Structures & Algorithms?'),
        e('p', null, 'You will write code that is both time and memory efficient. That is why we will learn ways to scale it using Big O notation of n.'),

        e('div', { className: 'info-card' },
          e('h4', null, 'Definition'),
          e('p', null, 'Big O notation is a mathematical way to describe how an algorithm\’s runtime or space needs grow as the input size gets large, by giving an upper bound on that growth rate. It lets you compare algorithms by their growth rates.')
        ),

        e('div', { className: 'info-card' },
          e('h4', null, 'What is Time Complexity?'),
          e('p', null, 'Time complexity measures how long an algorithm takes to run as the input size grows. We use Big O notation to describe it. For example:'),
          e('ul', null,
            e('li', null, 'O(1) - Constant time: always takes the same time'),
            e('li', null, 'O(n) - Linear time: grows with input size'),
            e('li', null, 'O(n²) - Quadratic time: grows exponentially'),
            e('li', null, 'O(log n) - Logarithmic time: much faster for large inputs')
          )
        ),
        e(ComplexityVisualizer)
      )
    );
  };

  return e('div', { className: 'container' },
    e('div', { className: 'header' },
      e('div', null,
        e('h1', null, 'Visualizer Dashboard'),
        e('p', { className: 'info-note' }, sectionInfo.summary)
      ),
      e('span', { className: 'theme-switch-wrapper' },
        e('input', {
          id: 'theme-toggle',
          type: 'checkbox',
          checked: theme === 'dark',
          onChange: () => setTheme(theme === 'light' ? 'dark' : 'light'),
        }),
        e('label', {
          htmlFor: 'theme-toggle',
          className: 'theme-switch-label',
        },
          e('span', { className: 'toggle-inner' }),
          e('span', { className: 'toggle-switch' })
        )
      )
    ),
    e('div', { className: 'section-buttons' },
      SECTIONS.map((section) => e('button', {
        key: section.id,
        className: `section-button${selectedSection === section.id ? ' active' : ''}`,
        onClick: () => setSelectedSection(section.id),
      }, section.label))
    ),
    e('div', { className: 'content-layout' },
      e('div', { className: 'section-card' },
        e('div', { className: 'section-panel' },
          e('h2', null, sectionInfo.title),
          e('p', { className: 'info-note' }, sectionInfo.summary),
          renderSection()
        )
      )
    )
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(e(App));
