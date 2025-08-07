import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Brain, Download, Send, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AnalysisSection {
  title: string;
  content: string;
  type: "summary" | "strengths" | "weaknesses" | "roles" | "gaps" | "score";
}

export default function Index() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisSection[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
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

    // Simulate API call with realistic delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const mockAnalysis: AnalysisSection[] = [
      {
        title: "Summary",
        content:
          "Experienced software engineer with 5+ years in full-stack development. Strong background in React, Node.js, and cloud technologies. Shows consistent career progression and leadership potential.",
        type: "summary",
      },
      {
        title: "Strengths",
        content:
          "• Excellent technical skills in modern web technologies\n• Strong problem-solving abilities\n• Experience with agile methodologies\n• Leadership experience managing small teams\n• Continuous learning mindset",
        type: "strengths",
      },
      {
        title: "Weaknesses",
        content:
          "• Limited experience with mobile development\n• Could benefit from more cloud architecture experience\n• Missing specific industry domain knowledge\n• Needs stronger project management certifications",
        type: "weaknesses",
      },
      {
        title: "Suggested Roles",
        content:
          "• Senior Frontend Developer\n• Full-Stack Engineer\n• Technical Lead\n• Software Architect (with additional experience)\n• Engineering Manager (entry-level)",
        type: "roles",
      },
      {
        title: "Skill Gaps",
        content:
          "• React Native or Flutter for mobile\n• AWS/Azure advanced certifications\n• System design for scale\n• DevOps and CI/CD pipelines\n• Machine learning fundamentals",
        type: "gaps",
      },
      {
        title: "Overall Score",
        content:
          "8.2/10 - Strong candidate with excellent technical foundation and growth potential. Ready for senior-level positions.",
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
            <Card className="p-6 h-[600px] backdrop-blur-sm bg-white/70 border-white/20 shadow-xl flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-slate-800">
                  Analysis Results
                </h2>
                {analysis.length > 0 && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Save PDF
                    </Button>
                    <Button variant="outline" size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Send to HR
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-4">
                {!showAnalysis ? (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <div className="text-center">
                      <Brain className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                      <p className="text-lg">Upload a resume to get started</p>
                    </div>
                  </div>
                ) : isAnalyzing ? (
                  // Loading skeleton
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className="flex gap-3"
                      >
                        <Avatar className="h-8 w-8 bg-gradient-to-r from-indigo-500 to-purple-500">
                          <AvatarFallback className="text-white text-sm">
                            AI
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-200 rounded animate-pulse" />
                          <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  // Analysis results with typewriter effect
                  <div className="space-y-4">
                    {analysis.map((section, index) => (
                      <motion.div
                        key={section.type}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.3 }}
                        className="flex gap-3"
                      >
                        <Avatar className="h-8 w-8 bg-gradient-to-r from-indigo-500 to-purple-500">
                          <AvatarFallback className="text-white text-sm">
                            AI
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-slate-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-slate-800">
                              {section.title}
                            </h3>
                            {section.type === "score" && (
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= 4
                                        ? "text-yellow-400 fill-current"
                                        : "text-slate-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.3 + 0.5 }}
                            className="text-slate-700 whitespace-pre-line leading-relaxed"
                          >
                            {section.content}
                          </motion.p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
