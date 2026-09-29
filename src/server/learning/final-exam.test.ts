import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AIProvider } from "@/ai/provider";

const getCourseBySlug=vi.fn(), findEnrollment=vi.fn(), calculateCourseProgress=vi.fn(), getCourseLessonsFlat=vi.fn();
const findFirst=vi.fn(), create=vi.fn(), updateMany=vi.fn();

vi.mock("@/server/courses",()=>({getCourseBySlug:(...a:unknown[])=>getCourseBySlug(...a)}));
vi.mock("@/server/learning/enrollment",()=>({findEnrollment:(...a:unknown[])=>findEnrollment(...a)}));
vi.mock("@/server/learning/progress",()=>({calculateCourseProgress:(...a:unknown[])=>calculateCourseProgress(...a)}));
vi.mock("@/server/course-content",()=>({getCourseLessonsFlat:(...a:unknown[])=>getCourseLessonsFlat(...a)}));
vi.mock("@/lib/prisma",()=>({prisma:{courseExamAttempt:{
  findFirst:(...a:unknown[])=>findFirst(...a),
  create:(...a:unknown[])=>create(...a),
  updateMany:(...a:unknown[])=>updateMany(...a),
}}}));

const { startFinalExam, submitFinalExam, FINAL_EXAM_PASSING_SCORE }=await import("@/server/learning/final-exam");

beforeEach(()=>{
  for(const fn of [getCourseBySlug,findEnrollment,calculateCourseProgress,getCourseLessonsFlat,findFirst,create,updateMany]) fn.mockReset();
  getCourseBySlug.mockResolvedValue({id:"c1",slug:"course-one",title:"Course One"});
  findEnrollment.mockResolvedValue({id:"e1"});
  calculateCourseProgress.mockResolvedValue({isComplete:true});
});

describe("final exam",()=>{
  it("generates grounded multiple-choice questions and stores answer keys server-side",async()=>{
    getCourseLessonsFlat.mockResolvedValue([{id:"l1",title:"Lesson",content:"The answer is grounded here."}]);
    findFirst.mockResolvedValue(null);
    const provider:AIProvider={name:"test",async generateCompletion(){return JSON.stringify({
      question:"Which statement matches the lesson?",choices:["A","B","C","D"],correctChoiceIndex:2,explanation:"C matches the lesson."
    });}};
    create.mockImplementation(async ({ data }: { data: {
      expiresAt: Date;
      questions: { create: Array<{ question: string; choices: string[] }> };
    } }) => ({
      id: "a1",
      expiresAt: data.expiresAt,
      course: { slug: "course-one" },
      questions: data.questions.create.map((question) => ({
        id: "q1",
        question: question.question,
        choices: question.choices,
        lesson: { title: "Lesson" },
      })),
    }));
    const result=await startFinalExam("s1","course-one",{provider});
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0]).not.toHaveProperty("correctChoiceIndex");
    expect(result.passingScore).toBe(FINAL_EXAM_PASSING_SCORE);
  });

  it("grades deterministically and requires 80 percent",async()=>{
    findFirst.mockResolvedValue({
      id:"a1",questions:[
        {id:"q1",correctChoiceIndex:1,explanation:"e1"},
        {id:"q2",correctChoiceIndex:2,explanation:"e2"},
        {id:"q3",correctChoiceIndex:0,explanation:"e3"},
        {id:"q4",correctChoiceIndex:3,explanation:"e4"},
        {id:"q5",correctChoiceIndex:1,explanation:"e5"},
      ],
    });
    updateMany.mockResolvedValue({count:1});
    const result=await submitFinalExam("s1","a1",[1,2,0,3,0]);
    expect(result.score).toBe(80);
    expect(result.passed).toBe(true);
    expect(updateMany).toHaveBeenCalledWith(expect.objectContaining({data:expect.objectContaining({score:80,passed:true})}));
  });
});
