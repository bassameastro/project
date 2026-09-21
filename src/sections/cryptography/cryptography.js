const e = React.createElement;
const { useState, useEffect, useMemo, useRef } = React;
import { caesarCipher } from '../../logic/caesar.js';

export const cryptographyTopicInfo = {
  title: 'Cryptography',
  summary: 'Explore a Caesar Cipher wheel with live shift controls and instant output.',
};

export const cryptographyModes = [
  { id: 'encrypt', label: 'Encrypt' },
  { id: 'decrypt', label: 'Decrypt' },
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DEFAULT_WHEEL_SIZE = 420;

// Letters are positioned at their BASE angle only — no shift baked in here.
// Rotation is applied exactly once, as a CSS transform on the ring container.
const buildBaseLetters = (letters, radius, centerX, centerY) => letters.map((char, index) => {
  const angle = (360 / letters.length) * index;
  const angleRad = (angle - 90) * Math.PI / 180;
  return {
    key: `${char}-${index}`,
    char,
    baseAngle: angle,
    x: centerX + radius * Math.cos(angleRad),
    y: centerY + radius * Math.sin(angleRad),
  };
});

export const CryptographySection = () => {
  const [plaintext, setPlaintext] = useState('HELLO WORLD');
  const [caesarShift, setCaesarShift] = useState(3);
  const [cipherMode, setCipherMode] = useState('encrypt');
  const [visualMode, setVisualMode] = useState('wheel');
  const [cipherText, setCipherText] = useState('');
  const [showLines, setShowLines] = useState(true);
  const [wheelSize, setWheelSize] = useState(DEFAULT_WHEEL_SIZE);
  const wheelRef = useRef(null);

  useEffect(() => {
    setCipherText(caesarCipher(plaintext, caesarShift, cipherMode));
  }, [plaintext, caesarShift, cipherMode]);

  useEffect(() => {
    const updateWheelSize = () => {
      if (wheelRef.current) {
        const nextSize = Math.max(260, wheelRef.current.clientWidth || DEFAULT_WHEEL_SIZE);
        setWheelSize(nextSize);
      }
    };

    updateWheelSize();
    window.addEventListener('resize', updateWheelSize);
    return () => window.removeEventListener('resize', updateWheelSize);
  }, []);

  const isDecrypt = cipherMode === 'decrypt';

  // The single source of truth for rotation. Encrypt spins one way,
  // decrypt the other — everything else (letters, lines) derives from this.
  const wheelRotation = (360 / 26) * caesarShift * (isDecrypt ? 1 : -1);

  const letterSize = Math.max(24, Math.round(wheelSize * 0.065));
  const outerCenter = wheelSize / 2;
  const outerRadius = wheelSize * 0.36;
  const innerInset = Math.round(wheelSize * 0.082);
  const innerBoxSize = wheelSize - innerInset * 2;
  const innerCenter = innerBoxSize / 2;
  const innerRadius = innerBoxSize * 0.31;

  const outerLetters = useMemo(
    () => buildBaseLetters(ALPHABET.split(''), outerRadius, outerCenter, outerCenter),
    [outerCenter, outerRadius]
  );

  // Inner letters: placed at base angle (unrotated). The ring container
  // applies the CSS rotation; each letter counter-rotates to stay upright.
  const innerLetters = useMemo(
    () => buildBaseLetters(ALPHABET.split(''), innerRadius, innerCenter, innerCenter),
    [innerCenter, innerRadius]
  );

  // Connector lines must be computed analytically (SVG doesn't inherit the
  // ring's CSS transform), using the SAME rotation angle as the ring.
  const connectorPoints = useMemo(() => {
    const direction = isDecrypt ? -1 : 1;
    return outerLetters.map((outer, i) => {
      const targetIndex = isDecrypt
        ? ((i - caesarShift) % 26 + 26) % 26
        : (i + caesarShift) % 26;
      const innerAngle = (360 / 26) * targetIndex + wheelRotation;
      const angleRad = (innerAngle - 90) * Math.PI / 180;
      return {
        key: outer.key,
        x1: outer.x,
        y1: outer.y,
        x2: innerCenter + innerRadius * Math.cos(angleRad) + innerInset,
        y2: innerCenter + innerRadius * Math.sin(angleRad) + innerInset,
      };
    });
  }, [outerLetters, caesarShift, isDecrypt, wheelRotation, innerCenter, innerRadius, innerInset]);

  const mappingGroups = useMemo(() => {
    const baseLetters = ALPHABET.split('');
    const groups = [];
    for (let start = 0; start < baseLetters.length; start += 13) {
      const originals = baseLetters.slice(start, start + 13);
      const shifted = originals.map((letter, index) => {
        const originalIndex = baseLetters.indexOf(letter);
        const shiftedIndex = isDecrypt
          ? ((originalIndex - caesarShift) % 26 + 26) % 26
          : (originalIndex + caesarShift) % 26;
        return baseLetters[shiftedIndex];
      });
      groups.push({ originals, shifted });
    }
    return groups;
  }, [caesarShift, isDecrypt]);

  const cryptoPseudocode = cipherMode === 'encrypt'
    ? [
        '1. Read each character in the message',
        '2. If it is a letter, find its alphabet position',
        '3. Add the shift value to the position',
        '4. If it passes Z, wrap around to A',
        '5. Replace the original letter with the shifted one',
        '6. Keep spaces and punctuation unchanged',
      ]
    : [
        '1. Read each character in the message',
        '2. If it is a letter, find its alphabet position',
        '3. Subtract the shift value from the position',
        '4. If it passes A, wrap around to Z',
        '5. Replace the letter with the decrypted one',
        '6. Keep spaces and punctuation unchanged',
      ];

  return e('div', { className: 'section-content' },
    e('div', { className: 'crypto-wheel-layout' },
      e('div', { className: 'card crypto-controls-card' },
        e('label', null, 'Mode', e('select', {
          value: cipherMode,
          onChange: (event) => setCipherMode(event.target.value),
        }, cryptographyModes.map((item) => e('option', { key: item.id, value: item.id }, item.label)))),
        e('label', null, 'Visual', e('select', {
          value: visualMode,
          onChange: (event) => setVisualMode(event.target.value),
        },
          e('option', { value: 'wheel' }, 'Wheel'),
          e('option', { value: 'table' }, 'Table')
        )),
        e('label', null, 'Shift', e('div', { className: 'crypto-shift-row' },
          e('input', {
            type: 'number',
            min: 0,
            max: 25,
            value: caesarShift,
            onChange: (event) => {
              const value = parseInt(event.target.value, 10);
              setCaesarShift(Math.min(25, Math.max(0, isNaN(value) ? 0 : value)));
            },
          }),
          e('input', {
            type: 'range',
            min: 0,
            max: 25,
            value: caesarShift,
            onChange: (event) => setCaesarShift(Number(event.target.value)),
          })
        )),
        e('label', null, 'Message', e('textarea', {
          value: plaintext,
          rows: 4,
          placeholder: 'Enter text to encrypt or decrypt',
          onChange: (event) => setPlaintext(event.target.value),
        })),
        ...(visualMode === 'wheel' ? [
          e('button', {
            className: 'primary',
            onClick: () => setShowLines((value) => !value),
          }, showLines ? 'Hide wheel lines' : 'Show wheel lines'),
        ] : []),
        e('div', { className: 'preview-box' },
          e('h3', null, cipherMode === 'encrypt' ? 'Encrypted Output' : 'Decrypted Output'),
          e('div', { className: 'cipher-output' }, cipherText || 'Type a message to see the result.')
        )
      ),
      e('div', { className: 'card crypto-visual-card' },
        visualMode === 'wheel'
          ? e('div', { className: 'crypto-wheel-card' },
              e('div', { className: 'crypto-wheel-title' },
                e('h3', null, 'Caesar Cipher Wheel'),
                e('p', null, 'Rotate the inner ring to see the shifted alphabet mapping.')
              ),
              e('div', { className: 'crypto-wheel', ref: wheelRef },
                e('svg', { className: `crypto-lines${showLines ? '' : ' hidden'}` },
                  connectorPoints.map((line) => e('line', {
                    key: `line-${line.key}`,
                    x1: line.x1,
                    y1: line.y1,
                    x2: line.x2,
                    y2: line.y2,
                    stroke: 'rgba(255,255,255,0.45)',
                    strokeWidth: 1.4,
                  }))
                ),
                e('div', { className: 'crypto-ring crypto-outer-ring' },
                  outerLetters.map((letter) => e('div', {
                    key: letter.key,
                    className: 'crypto-letter crypto-letter-outer',
                    style: {
                      left: `${letter.x - letterSize / 2}px`,
                      top: `${letter.y - letterSize / 2}px`,
                      width: `${letterSize}px`,
                      height: `${letterSize}px`,
                    },
                  }, letter.char))
                ),
                e('div', {
                  className: 'crypto-ring crypto-inner-ring',
                  style: {
                    width: `${innerBoxSize}px`,
                    height: `${innerBoxSize}px`,
                    left: `${innerInset}px`,
                    top: `${innerInset}px`,
                    transform: `rotate(${wheelRotation}deg)`,
                  },
                }, innerLetters.map((letter) => e('div', {
                  key: letter.key,
                  className: 'crypto-letter crypto-letter-inner',
                  style: {
                    left: `${letter.x - letterSize / 2}px`,
                    top: `${letter.y - letterSize / 2}px`,
                    width: `${letterSize}px`,
                    height: `${letterSize}px`,
                    transform: `rotate(${-wheelRotation}deg)`,
                  },
                }, letter.char))),
                e('div', { className: 'crypto-center' }, e('span', null, cipherMode === 'encrypt' ? 'ENC' : 'DEC'))
              )
            )
          : e('div', { className: 'crypto-table-card' },
              e('div', { className: 'crypto-wheel-title' },
                e('h3', null, 'Letter Mapping'),
                e('p', null, `Complete mapping for shift ${caesarShift} (shift by ${caesarShift} positions)`)
              ),
              e('div', { className: 'crypto-mapping-wrapper' },
                mappingGroups.map((group, groupIndex) => e('div', { key: `map-group-${groupIndex}`, className: 'crypto-mapping-group' },
                  e('div', { className: 'crypto-mapping-row crypto-mapping-original' },
                    group.originals.map((letter) => e('div', {
                      key: `orig-${letter}-${groupIndex}`,
                      className: 'crypto-map-letter crypto-map-letter-original',
                    }, letter))
                  ),
                  e('div', { className: 'crypto-mapping-arrows' },
                    group.originals.map((letter) => e('span', {
                      key: `arrow-${letter}-${groupIndex}`,
                      className: 'crypto-map-arrow',
                    }, '↓'))
                  ),
                  e('div', { className: 'crypto-mapping-row crypto-mapping-shifted' },
                    group.shifted.map((letter) => e('div', {
                      key: `shift-${letter}-${groupIndex}`,
                      className: 'crypto-map-letter crypto-map-letter-shifted',
                    }, letter))
                  )
                ))
              ),
              e('div', { className: 'crypto-map-legend' },
                e('span', { className: 'crypto-legend-item' }, e('span', { className: 'crypto-legend-swatch original' }, null), 'Original'),
                e('span', { className: 'crypto-legend-item' }, e('span', { className: 'crypto-legend-swatch shifted' }, null), 'Encrypted')
              )
            ),
        e('div', { className: 'crypto-pseudocode-panel' },
          e('div', { className: 'algorithm-pseudocode-title' }, cipherMode === 'encrypt' ? 'Encryption Pseudocode' : 'Decryption Pseudocode'),
          e('div', { className: 'algorithm-pseudocode-code' },
            cryptoPseudocode.map((line, index) => e('div', {
              key: `crypto-pseudo-${cipherMode}-${index}`,
              className: 'algorithm-pseudocode-line active',
            }, e('span', { className: 'algorithm-pseudocode-number' }, `${index + 1}`), e('span', null, line)))
          )
        )
      )
    )
  );
};