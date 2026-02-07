import React, { useState, useEffect } from 'react';
import { MicButton } from './MicButton.js';
import { Spectrogram } from './Spectrogram.js';
import { useRecorder } from '../hooks/useRecorder.js';
import { useAcousticTransmit } from '../hooks/useAcousticTransmit.js';
import { api, type EncodeResult } from '../api/client.js';

export function EncodePanel() {
  const recorder = useRecorder();
  const acoustic = useAcousticTransmit();
  const [transcript, setTranscript] = useState('');
  const [encoded, setEncoded] = useState<EncodeResult | null>(null);
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [textInput, setTextInput] = useState('');

  // When recording stops, send audio to STT
  useEffect(() => {
    if (recorder.audioBlob && !recorder.isRecording) {
      setLoading('Transcribing...');
      setError('');
      api.stt(recorder.audioBlob)
        .then(res => {
          setTranscript(res.transcript);
          setLoading('');
        })
        .catch(err => {
          setError(String(err));
          setLoading('');
        });
    }
  }, [recorder.audioBlob, recorder.isRecording]);

  const handleEncode = async () => {
    const text = transcript || textInput;
    if (!text) return;
    setLoading('AI Analyzing...');
    setError('');
    setEncoded(null); // Clear previous results
    try {
      const result = await api.encode(text);
      setEncoded(result);
    } catch (err) {
      setError(String(err));
    }
    setLoading('');
  };

  const handleTransmit = async () => {
    if (!encoded || !encoded.isEmergency) return;
    const bytes = new Uint8Array(encoded.hex.match(/.{2}/g)!.map(h => parseInt(h, 16)));
    await acoustic.transmit(bytes);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-emergency-amber">🧠 AI Command Center</h2>

      {/* Voice input */}
      <div className="flex items-center gap-4">
        <MicButton
          isRecording={recorder.isRecording}
          onClick={recorder.isRecording ? recorder.stop : recorder.start}
        />
        <div className="text-sm text-gray-400">
          {recorder.isRecording ? 'Recording... click to stop' : 'Click to record voice message'}
        </div>
      </div>

      {/* Text input fallback */}
      <div>
        <textarea
          value={transcript || textInput}
          onChange={(e) => { setTextInput(e.target.value); setTranscript(''); }}
          placeholder="Or type your emergency message here..."
          className="w-full h-24 bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-emergency-amber"
        />
      </div>

      {/* Encode button */}
      <button
        onClick={handleEncode}
        disabled={!!loading || (!transcript && !textInput)}
        className="w-full px-6 py-3 bg-emergency-amber text-black font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading || '🔍 Analyze with AI'}
      </button>

      {error && <div className="text-red-400 text-sm bg-red-950/30 border border-red-800 rounded-lg p-3">{error}</div>}

      {/* AI ANALYSIS SECTION */}
      {encoded && (
        <div className="space-y-4 border-t border-neutral-700 pt-4">

          {/* AI Reasoning Trace */}
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
              <h3 className="text-sm font-bold text-cyan-400">AI REASONING</h3>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {encoded.reasoning || 'No reasoning provided'}
            </p>
          </div>

          {/* Confidence Score */}
          {encoded.confidence !== undefined && (
            <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-2">Confidence Score</div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-neutral-800 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${encoded.confidence >= 0.7 ? 'bg-green-500' :
                        encoded.confidence >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    style={{ width: `${encoded.confidence * 100}%` }}
                  ></div>
                </div>
                <div className="text-lg font-bold text-white min-w-[60px] text-right">
                  {(encoded.confidence * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          )}

          {/* DECISION: ACCEPTED or REJECTED */}
          {encoded.isEmergency ? (
            <div className="bg-green-950/30 border-2 border-green-600 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">✅</div>
                <div>
                  <div className="text-lg font-bold text-green-400">EMERGENCY ACCEPTED</div>
                  <div className="text-xs text-gray-400">Message approved for encoding</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-neutral-900/50 rounded p-2">
                  <div className="text-gray-400">Type</div>
                  <div className="font-bold text-white">{encoded.fields.type}</div>
                </div>
                <div className="bg-neutral-900/50 rounded p-2">
                  <div className="text-gray-400">Severity</div>
                  <div className="font-bold text-red-400">{encoded.fields.severity}/9</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-950/30 border-2 border-red-600 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-3xl">❌</div>
                <div>
                  <div className="text-lg font-bold text-red-400">NON-EMERGENCY</div>
                  <div className="text-xs text-gray-400">Message rejected by AI gatekeeper</div>
                </div>
              </div>
              <div className="text-sm text-gray-300 bg-neutral-900/50 rounded p-3 mt-3">
                <span className="font-semibold">Reason:</span> {encoded.rejectionReason}
              </div>
            </div>
          )}

          {/* Encoded result - only show for accepted emergencies */}
          {encoded.isEmergency && (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">📦 Semantic Code (24 bytes):</div>
                <div className="font-mono text-cyan-400 bg-neutral-900 border border-neutral-700 p-3 rounded-lg break-all text-xs">
                  {encoded.hex}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Fields:</div>
                <pre className="text-xs text-gray-300 bg-neutral-900 border border-neutral-700 p-3 rounded-lg overflow-auto">
                  {JSON.stringify(encoded.fields, null, 2)}
                </pre>
              </div>

              {/* Transmit */}
              <button
                onClick={handleTransmit}
                disabled={acoustic.isPlaying}
                className="w-full px-6 py-3 bg-emergency-red text-white font-bold rounded-lg hover:bg-red-500 disabled:opacity-50 transition-all"
              >
                {acoustic.isPlaying ? `Transmitting... ${Math.round(acoustic.progress * 100)}%` : '📡 Sign & Transmit'}
              </button>

              {acoustic.isPlaying && (
                <div className="w-full bg-neutral-800 rounded-full h-2">
                  <div
                    className="bg-emergency-red h-2 rounded-full transition-all"
                    style={{ width: `${acoustic.progress * 100}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
