import "dotenv/config";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { prisma } from "@/lib/prisma";
import { SUPPORTED_LOCALES, type Locale } from "@/i18n/config";
import { getCourseAdvisorRecommendation } from "@/server/advisor/advisor-service";
import { getTutorAnswer } from "@/server/tutor/tutor-service";
import { getLearningCoachAdvice } from "@/server/learning/learning-coach";
import { generatePracticeQuestion } from "@/server/learning/practice";
import { enrollInCourse } from "@/server/learning/enrollment";
import { getLocalizedCourseContent } from "@/server/localized-content";
const prompts: Record<Locale,string>={en:"I want to learn cybersecurity.",es:"Quiero aprender ciberseguridad.",pt:"Quero aprender programação.",fr:"Je veux apprendre l'intelligence artificielle.",de:"Ich möchte Projektmanagement lernen."};
const studentId=`i18n-acceptance-${randomUUID()}`; const courseSlug="javascript-fundamentals"; const lessonSlug="variables-and-data-types";
async function main(){
 await enrollInCourse(studentId,courseSlug); const course=await prisma.course.findUniqueOrThrow({where:{slug:courseSlug}});
 const samples=[];
 for(const locale of SUPPORTED_LOCALES){
  const localized=await getLocalizedCourseContent(course.id,locale,{includeDrafts:true}); const localizedLesson=localized.flatMap((m)=>m.lessons).find((l)=>l.slug===lessonSlug); if(!localizedLesson)throw new Error(`${locale}: localized lesson retrieval failed`);
  const advisor=await getCourseAdvisorRecommendation(prompts[locale],{locale}); const advisorSlugs=advisor.recommendations.map((r)=>r.course.slug); if(await prisma.course.count({where:{slug:{in:advisorSlugs}}})!==advisorSlugs.length)throw new Error(`${locale}: Advisor grounding failed`);
  const tutor=await getTutorAnswer({courseSlug,lessonSlug,question:locale==="en"?"What is a variable?":"Explain the current lesson.",responseMode:"SIMPLE",history:[],locale},studentId); if(tutor.relevantLessons.some((r)=>r.slug!==lessonSlug&&!localized.flatMap((m)=>m.lessons).some((l)=>l.slug===r.slug)))throw new Error(`${locale}: Tutor grounding failed`);
  const coach=await getLearningCoachAdvice(studentId,courseSlug,{locale}); if(coach.courseSlug!==courseSlug)throw new Error(`${locale}: Coach canonical course changed`);
  const practice=await generatePracticeQuestion(studentId,courseSlug,lessonSlug,{locale}); if(practice.courseSlug!==courseSlug||practice.lessonSlug!==lessonSlug)throw new Error(`${locale}: Practice grounding failed`);
  samples.push({locale,localizedLessonTitle:localizedLesson.title,advisor:{slugs:advisorSlugs,reasons:advisor.recommendations.map((r)=>r.reason),pathSummary:advisor.pathSummary},tutor:{answer:tutor.answer.slice(0,600),lessonSlugs:tutor.relevantLessons.map((r)=>r.slug)},coach:{explanation:coach.explanation.slice(0,600),tips:coach.studyTips},practice:{type:practice.questionType,question:practice.question,choices:practice.choices}}); console.log(`ok ${locale}: Advisor, Tutor, Coach, Practice structured and grounded`);
 }
 await mkdir("translation-exports",{recursive:true}); await writeFile("translation-exports/i18n-quality-report.json",JSON.stringify({generatedAt:new Date().toISOString(),note:"Human language-quality review required; this report proves structure and grounding only.",samples},null,2));
}
main().finally(async()=>{await prisma.practiceSession.deleteMany({where:{studentId}});await prisma.learningActivity.deleteMany({where:{studentId}});await prisma.lessonProgress.deleteMany({where:{studentId}});await prisma.studentEnrollment.deleteMany({where:{studentId}});await prisma.$disconnect();});
