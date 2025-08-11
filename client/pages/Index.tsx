import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import {
  Upload,
  FileText,
  Brain,
  Download,
  Send,
  Bot,
  CheckCircle,
  XCircle,
  User,
  TrendingUp,
  AlertTriangle,
  Briefcase,
  Target,
  BarChart3,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ApiResponse {
  resumeText: string;
  email: string;
  phone: string;
  experience: {
    company: string;
    duration: string;
    role: string;
    responsibilities: string[];
  }[];
  totalExperienceInYears: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggested_roles: string[];
  skill_gaps: string[];
  impact: number;
  skills_score: number;
  overall_score: number | null;
  matched: boolean;
  questions_answers: {
    question: string;
    answer: string;
    reason: string;
  }[];
  route: string;
  missingSkills: string[];
}

// Skeleton loader for analysis results
const AnalysisSkeleton = () => (
  <div className="space-y-6">
    {[1, 2, 3, 4, 5].map((i) => (
      <Card key={i} className="animate-pulse">
        <CardHeader>
          <div className="h-4 bg-slate-200 rounded w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 rounded" />
            <div className="h-3 bg-slate-200 rounded w-5/6" />
            <div className="h-3 bg-slate-200 rounded w-4/6" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Score Circle Component
const ScoreCircle = ({
  score,
  size = 120,
}: {
  score: number;
  size?: number;
}) => {
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-slate-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-indigo-500 transition-all duration-1000"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-800">{score}</div>
          <div className="text-xs text-slate-500">Overall</div>
        </div>
      </div>
    </div>
  );
};

// Individual Score Item
const ScoreItem = ({
  label,
  value,
  max = 100,
}: {
  label: string;
  value: number;
  max?: number;
}) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-slate-600">{label}</span>
    <div className="flex items-center gap-2 flex-1 max-w-[120px]">
      <Progress value={(value / max) * 100} className="flex-1" />
      <span className="text-sm font-medium text-slate-800 min-w-[40px]">
        {value}/{max}
      </span>
    </div>
  </div>
);

export default function Index() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ApiResponse | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const exportToPDF = () => {
    if (!analysis) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 11) => {
      doc.setFontSize(fontSize);
      const splitText = doc.splitTextToSize(text, maxWidth);
      doc.text(splitText, x, y);
      return y + (splitText.length * fontSize * 0.4);
    };

    // Helper function to check if we need a new page
    const checkNewPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
    };

    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Resume Analysis Report', 20, yPosition);
    yPosition += 15;

    // Matched Badge
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    const matchedText = analysis.matched ? '✓ MATCHED' : '✗ NOT MATCHED';
    const matchedColor = analysis.matched ? [34, 197, 94] : [239, 68, 68];
    doc.setTextColor(matchedColor[0], matchedColor[1], matchedColor[2]);
    doc.text(matchedText, 20, yPosition);
    doc.setTextColor(0, 0, 0); // Reset to black
    yPosition += 15;

    // Score Breakdown Section
    checkNewPage(60);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('📊 Score Breakdown', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Overall Score: ${analysis.overall_score || 0}/100`, 20, yPosition);
    yPosition += 8;
    doc.text(`Years of Experience: ${analysis.totalExperienceInYears}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Impact Score: ${analysis.impact}/100`, 20, yPosition);
    yPosition += 8;
    doc.text(`Skills Score: ${analysis.skills_score}/100`, 20, yPosition);
    yPosition += 15;

    // Summary Section
    checkNewPage(40);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('👤 Summary', 20, yPosition);
    yPosition += 10;

    doc.setFont(undefined, 'normal');
    yPosition = addWrappedText(analysis.summary, 20, yPosition, pageWidth - 40);
    yPosition += 10;

    // Strengths Section
    checkNewPage(30 + analysis.strengths.length * 8);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('📈 Strengths', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    analysis.strengths.forEach(strength => {
      checkNewPage(10);
      yPosition = addWrappedText(`• ${strength}`, 25, yPosition, pageWidth - 50);
      yPosition += 2;
    });
    yPosition += 8;

    // Weaknesses Section
    checkNewPage(30 + analysis.weaknesses.length * 8);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('⚠️ Areas for Improvement', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    analysis.weaknesses.forEach(weakness => {
      checkNewPage(10);
      yPosition = addWrappedText(`• ${weakness}`, 25, yPosition, pageWidth - 50);
      yPosition += 2;
    });
    yPosition += 8;

    // Suggested Roles Section
    checkNewPage(30 + analysis.suggested_roles.length * 8);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('💼 Suggested Roles', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    analysis.suggested_roles.forEach(role => {
      checkNewPage(10);
      yPosition = addWrappedText(`• ${role}`, 25, yPosition, pageWidth - 50);
      yPosition += 2;
    });
    yPosition += 8;

    // Skill Gaps Section
    checkNewPage(30 + analysis.skill_gaps.length * 8);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('🎯 Skill Gaps & Development Areas', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    analysis.skill_gaps.forEach(gap => {
      checkNewPage(10);
      yPosition = addWrappedText(`• ${gap}`, 25, yPosition, pageWidth - 50);
      yPosition += 2;
    });
    yPosition += 8;

    // Question Analysis Section
    if (analysis.questions_answers.length > 0) {
      checkNewPage(40);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('🧠 Detailed Analysis', 20, yPosition);
      yPosition += 15;

      analysis.questions_answers.forEach((qa, index) => {
        checkNewPage(25);

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        yPosition = addWrappedText(`Q${index + 1}: ${qa.question}`, 20, yPosition, pageWidth - 40, 12);
        yPosition += 3;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        const answerSymbol = qa.answer.toLowerCase() === 'yes' ? '✓' : '✗';
        const answerColor = qa.answer.toLowerCase() === 'yes' ? [34, 197, 94] : [239, 68, 68];
        doc.setTextColor(answerColor[0], answerColor[1], answerColor[2]);
        doc.text(`${answerSymbol} ${qa.answer.toUpperCase()}`, 20, yPosition);
        doc.setTextColor(0, 0, 0); // Reset to black
        yPosition += 8;

        yPosition = addWrappedText(`Reason: ${qa.reason}`, 20, yPosition, pageWidth - 40);
        yPosition += 10;
      });
    }

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Generated by Resume Analyzer - Page ${i} of ${totalPages}`, 20, pageHeight - 10);
      doc.text(new Date().toLocaleDateString(), pageWidth - 40, pageHeight - 10);
    }

    // Save the PDF
    doc.save('resume-analysis.pdf');
  };

  const analyzeResume = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Convert file to base64
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result?.toString().split(",")[1] || "");
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const body = {
        fileBase64,
        filename: "resume.pdf",
      };

      const response = await fetch("http://localhost:3000/analyze-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error("Error analyzing resume:", err);
      setError("Failed to analyze resume. Please try again.");

      // Fallback to mock data for demo purposes
      const mockData: ApiResponse = {
        resumeText: "Sample resume text...",
        email: "priyaank29@gmail.com",
        phone: "+91 93266 22519",
        experience: [
          {
            company: "Freelance",
            duration: "September 2021 – Present",
            role: "Software Engineer, Lead Software Engineer",
            responsibilities: [
              "Engineered scalable, high-performance web applications using Next.js, React, and Node.js",
              "Architected and deployed cloud-native backend systems leveraging Firebase, AWS, and GCP",
              "Led infrastructure automation initiatives, setting up CI/CD pipelines",
            ],
          },
        ],
        totalExperienceInYears: 6.9,
        summary:
          "Versatile software engineer with nearly 7 years of experience specializing in full-stack web development, cloud-native backend systems, and automation.",
        strengths: [
          "Strong expertise in full-stack development using modern frameworks",
          "Proficient in cloud technologies including AWS, GCP, and Firebase",
          "Demonstrated leadership in infrastructure automation and CI/CD pipeline setup",
        ],
        weaknesses: [
          "Relatively short tenure at some roles which may raise questions about stability",
          "Limited explicit mention of formal leadership roles beyond freelance",
          "No direct mention of advanced certifications",
        ],
        suggested_roles: [
          "Senior Full-Stack Developer",
          "Cloud Solutions Engineer",
          "Lead Software Engineer",
          "DevOps Engineer",
        ],
        skill_gaps: [
          "Advanced DevOps tools beyond Docker and GitHub Actions",
          "Deeper expertise in machine learning frameworks",
          "Formal leadership or management training",
        ],
        impact: 80,
        skills_score: 85,
        overall_score: 82,
        matched: true,
        questions_answers: [
          {
            question:
              "Does the candidate have experience with cloud platforms?",
            answer: "yes",
            reason:
              "Extensive experience with AWS, GCP, and Firebase mentioned throughout the resume",
          },
          {
            question: "Does the candidate have leadership experience?",
            answer: "yes",
            reason:
              "Led infrastructure automation initiatives and mentored junior developers",
          },
        ],
        route: "senior",
        missingSkills: ["System Design", "Mentorship", "Project Management"],
      };
      setAnalysis(mockData);
    } finally {
      setIsAnalyzing(false);
    }
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
            Get comprehensive AI-powered insights about your resume
          </p>
        </motion.div>

        {/* Main Layout - Responsive columns */}
        <div className="grid lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
          {/* Left Side - Upload (smaller) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4"
          >
            <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">
                  Upload Resume
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload Area */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
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
                      <FileText className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    ) : (
                      <Upload className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    )}
                  </motion.div>

                  <div className="space-y-1">
                    {file ? (
                      <>
                        <p className="font-medium text-green-700">
                          {file.name}
                        </p>
                        <p className="text-sm text-green-600">
                          {formatFileSize(file.size)}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-slate-700">
                          Drop resume or click to upload
                        </p>
                        <p className="text-sm text-slate-500">PDF or DOCX</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Analyze Button */}
                {file && (
                  <Button
                    onClick={analyzeResume}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    size="lg"
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
                )}

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Side - Analysis Results (larger) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-8"
          >
            <div className="space-y-6">
              {/* Analysis Header */}
              {analysis && (
                <Card className="backdrop-blur-sm bg-white/90 border-white/20 shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bot className="h-6 w-6 text-indigo-600" />
                        <CardTitle className="text-xl">
                          AI Analysis Results
                        </CardTitle>
                        <Badge
                          variant={analysis.matched ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {analysis.matched ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" /> Matched
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" /> Not Matched
                            </>
                          )}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                        <Button variant="outline" size="sm">
                          <Send className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )}

              {/* Content Area */}
              <AnimatePresence mode="wait">
                {!analysis && !isAnalyzing ? (
                  <motion.div
                    key="empty-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center h-96"
                  >
                    <div className="text-center">
                      <Brain className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                      <p className="text-lg font-medium text-slate-600">
                        Ready to analyze
                      </p>
                      <p className="text-slate-500">
                        Upload a resume to get started
                      </p>
                    </div>
                  </motion.div>
                ) : isAnalyzing ? (
                  <motion.div
                    key="loading-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <AnalysisSkeleton />
                  </motion.div>
                ) : analysis ? (
                  <motion.div
                    key="analysis-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {/* Score Breakdown */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-indigo-600" />
                          Score Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-8">
                          <div className="flex-shrink-0">
                            <ScoreCircle score={analysis.overall_score || 0} />
                          </div>
                          <div className="flex-1 space-y-4">
                            <div className="text-center mb-4">
                              <div className="text-2xl font-bold text-slate-800">{analysis.totalExperienceInYears}</div>
                              <div className="text-sm text-slate-500">Years of Experience</div>
                            </div>
                            <ScoreItem label="Impact" value={analysis.impact} />
                            <ScoreItem
                              label="Skills Score"
                              value={analysis.skills_score}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Key Insights Cards */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Summary */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="h-5 w-5 text-blue-600" />
                            Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-700 leading-relaxed">
                            {analysis.summary}
                          </p>
                        </CardContent>
                      </Card>

                      {/* Strengths */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            Strengths
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {analysis.strengths.map((strength, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-slate-700"
                              >
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      {/* Weaknesses */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                            Areas for Improvement
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {analysis.weaknesses.map((weakness, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-slate-700"
                              >
                                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      {/* Suggested Roles */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Briefcase className="h-5 w-5 text-purple-600" />
                            Suggested Roles
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {analysis.suggested_roles.map((role, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-slate-700"
                              >
                                <Briefcase className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{role}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Skill Gaps */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-red-600" />
                          Skill Gaps & Development Areas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="grid md:grid-cols-2 gap-2">
                          {analysis.skill_gaps.map((gap, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-slate-700"
                            >
                              <Target className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Detailed Question Analysis */}
                    {analysis.questions_answers.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5 text-indigo-600" />
                            Detailed Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left p-2 font-medium">
                                    Question
                                  </th>
                                  <th className="text-center p-2 font-medium w-20">
                                    Answer
                                  </th>
                                  <th className="text-left p-2 font-medium">
                                    Reasoning
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {analysis.questions_answers.map((qa, index) => (
                                  <tr
                                    key={index}
                                    className="border-b last:border-b-0"
                                  >
                                    <td className="p-3 text-sm text-slate-700">
                                      {qa.question}
                                    </td>
                                    <td className="p-3 text-center">
                                      {qa.answer.toLowerCase() === "yes" ? (
                                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                                      ) : (
                                        <X className="h-5 w-5 text-red-500 mx-auto" />
                                      )}
                                    </td>
                                    <td className="p-3 text-sm text-slate-600">
                                      {qa.reason}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
