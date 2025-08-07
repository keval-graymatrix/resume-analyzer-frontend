import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Brain, Download, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AnalysisSection {
  title: string;
  emoji: string;
  content: string;
  type: "summary" | "strengths" | "weaknesses" | "roles" | "gaps" | "score";
}

// Custom typewriter hook
const useTypewriter = (text: string, speed: number = 30) => {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;
    
    setDisplayText("");
    setIsComplete(false);
    let i = 0;
    
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayText, isComplete };
};

// Skeleton message component
const SkeletonMessage = ({ delay }: { delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="flex gap-3 mb-4"
  >
    <Avatar className="h-8 w-8 bg-gradient-to-r from-indigo-500 to-purple-500 flex-shrink-0">
      <AvatarFallback className="text-white text-xs">
        <Bot className="h-4 w-4" />
      </AvatarFallback>
    </Avatar>
    <div className="flex-1 bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm border border-slate-100">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse bg-[length:200%_100%] bg-gradient-animation" />
          <div className="h-3 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse bg-[length:200%_100%] bg-gradient-animation w-5/6" />
          <div className="h-3 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse bg-[length:200%_100%] bg-gradient-animation w-4/6" />
        </div>
      </div>
    </div>
  </motion.div>
);

// Typewriter message component
const TypewriterMessage = ({ section, delay }: { section: AnalysisSection; delay: number }) => {
  const [showMessage, setShowMessage] = useState(false);
  const { displayText, isComplete } = useTypewriter(section.content, 25);

  useEffect(() => {
    const timer = setTimeout(() => setShowMessage(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!showMessage) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex gap-3 mb-4"
    >
      <Avatar className="h-8 w-8 bg-gradient-to-r from-indigo-500 to-purple-500 flex-shrink-0">
        <AvatarFallback className="text-white text-xs">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm border border-slate-100 max-w-[85%]">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{section.emoji}</span>
          <h3 className="font-semibold text-slate-800 text-sm">
            {section.title}
          </h3>
        </div>
        <div className="text-slate-700 text-sm leading-relaxed">
          <span className="whitespace-pre-line">{displayText}</span>
          {!isComplete && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="text-indigo-500 font-bold ml-1"
            >
              |
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function Index() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisSection[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSkeletons, setShowSkeletons] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (
      droppedFile &&
      (droppedFile.type === "application/pdf" ||
        droppedFile.name.endsWith(".docx"))
    ) {
      setFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const analyzeResume = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setShowAnalysis(true);
    setShowSkeletons(true);
    setAnalysis([]);

    // Show skeletons for 3 seconds
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    setShowSkeletons(false);

    const mockAnalysis: AnalysisSection[] = [
      {
        title: "Summary",
        emoji: "🔍",
        content:
          "Experienced software engineer with 5+ years in full-stack development. Strong background in React, Node.js, and cloud technologies. Shows consistent career progression and leadership potential.",
        type: "summary",
      },
      {
        title: "Strengths",
        emoji: "✅",
        content:
          "• Excellent technical skills in modern web technologies\n• Strong problem-solving abilities\n• Experience with agile methodologies\n• Leadership experience managing small teams\n• Continuous learning mindset",
        type: "strengths",
      },
      {
        title: "Weaknesses",
        emoji: "❌",
        content:
          "• Limited experience with mobile development\n• Could benefit from more cloud architecture experience\n• Missing specific industry domain knowledge\n• Needs stronger project management certifications",
        type: "weaknesses",
      },
      {
        title: "Suggested Roles",
        emoji: "💼",
        content:
          "• Senior Frontend Developer\n• Full-Stack Engineer\n• Technical Lead\n• Software Architect (with additional experience)\n• Engineering Manager (entry-level)",
        type: "roles",
      },
      {
        title: "Skill Gaps",
        emoji: "🛠️",
        content:
          "• React Native or Flutter for mobile\n• AWS/Azure advanced certifications\n• System design for scale\n• DevOps and CI/CD pipelines\n• Machine learning fundamentals",
        type: "gaps",
      },
      {
        title: "Score Breakdown",
        emoji: "📊",
        content:
          "Technical Skills: 9/10\nExperience Level: 8/10\nLeadership Potential: 7/10\nAdaptability: 8/10\n\nOverall Score: 8.2/10 - Strong candidate with excellent technical foundation and growth potential. Ready for senior-level positions.",
        type: "score",
      },
    ];

    setAnalysis(mockAnalysis);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-10 w-10 text-indigo-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Resume Analyzer
            </h1>
          </div>
          <p className="text-slate-600 text-lg">
            Get AI-powered insights about your resume in seconds
          </p>
        </motion.div>

        {/* Main Split Layout */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Side - Upload */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-8 h-fit backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
              <h2 className="text-2xl font-semibold mb-6 text-slate-800">
                Upload Your Resume
              </h2>

              {/* Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                  isDragOver
                    ? "border-indigo-500 bg-indigo-50/50"
                    : file
                      ? "border-green-500 bg-green-50/50"
                      : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                <motion.div
                  animate={{ scale: isDragOver ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {file ? (
                    <FileText className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  ) : (
                    <Upload className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  )}
                </motion.div>

                <div className="space-y-2">
                  {file ? (
                    <>
                      <p className="text-lg font-medium text-green-700">
                        {file.name}
                      </p>
                      <p className="text-sm text-green-600">
                        {formatFileSize(file.size)}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-medium text-slate-700">
                        Drop your resume here or click to upload
                      </p>
                      <p className="text-sm text-slate-500">(.pdf, .docx)</p>
                    </>
                  )}
                </div>

                {isDragOver && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-indigo-500/10 rounded-xl flex items-center justify-center"
                  >
                    <div className="text-indigo-600 font-medium">
                      Drop to upload
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Analyze Button */}
              {file && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <Button
                    onClick={analyzeResume}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 text-lg shadow-lg"
                  >
                    {isAnalyzing ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <Brain className="h-5 w-5 mr-2" />
                        Analyze Resume
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </Card>
          </motion.div>

          {/* Right Side - Analysis */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="h-[600px] backdrop-blur-sm bg-slate-50/80 border-white/20 shadow-xl flex flex-col rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-slate-200/50 bg-white/60">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <Bot className="h-5 w-5 text-indigo-600" />
                  AI Analysis
                </h2>
                {analysis.length > 0 && !isAnalyzing && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs">
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Send className="h-3 w-3 mr-1" />
                      Share
                    </Button>
                  </div>
                )}
              </div>

              {/* Chat-like scrollable area */}
              <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-slate-50/50 to-white/50">
                <AnimatePresence mode="wait">
                  {!showAnalysis ? (
                    <motion.div
                      key="empty-state"
                      className="flex items-center justify-center h-full text-slate-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="text-center">
                        <div className="relative mb-4">
                          <Brain className="h-16 w-16 mx-auto text-slate-300" />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 h-16 w-16 mx-auto border-2 border-slate-200 rounded-full"
                          />
                        </div>
                        <p className="text-lg font-medium">Ready to analyze your resume</p>
                        <p className="text-sm text-slate-400 mt-1">Upload a file to get started</p>
                      </div>
                    </motion.div>
                  ) : showSkeletons ? (
                    <motion.div
                      key="skeleton-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {[0, 1, 2, 3, 4].map((i) => (
                        <SkeletonMessage key={i} delay={i * 0.3} />
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="analysis-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2"
                    >
                      {analysis.map((section, index) => (
                        <TypewriterMessage
                          key={section.type}
                          section={section}
                          delay={index * 1500}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient-animation {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .bg-gradient-animation {
          animation: gradient-animation 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
