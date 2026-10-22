import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const verifiedContext = `أنت مساعد بدر، مساعد عربي متخصص لعلامة بدر أبا الخيل للعود والعطور والزعفران. الشعار الرسمي هو «عزنا بطيبنا». المصدر المؤكد المتاح حاليًا هو الموقع الرسمي https://baderabalkhail.com، وفيه أقسام خشب العود والعطور وصفحة التخفيضات. لا تخترع أسماء منتجات أو أسعارًا أو مخزونًا أو مكونات أو ثباتًا أو فوحانًا أو عروضًا. إذا لم تتوفر المعلومة، قل بوضوح إنها غير موصولة بعد ووجّه المستخدم إلى الرابط الرسمي. تكلم بعربية طبيعية قصيرة وبأسلوب سعودي مهذب. اسأل سؤالًا واحدًا فقط عند الحاجة لتضييق الاحتياج.`;

// لا يوجد كتالوج منتجات موصول ومتحقق منه في هذه المرحلة. لذلك لا نسمح
// للنموذج بصياغة ادعاءات عن منتجات أو أسعار حتى لو كانت الخدمة متاحة.
const hasVerifiedProductCatalog = false;

async function askModel(message: string, history: Array<{ role: "user" | "assistant"; content: string }>) {
  if (!hasVerifiedProductCatalog) return null;
  const baseUrl = process.env.MANUS_API_URL;
  const apiKey = process.env.MANUS_API_KEY;
  if (!baseUrl || !apiKey) return null;

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: verifiedContext },
        ...history.slice(-8),
        { role: "user", content: message },
      ],
    }),
  });

  if (!response.ok) {
    console.warn("[Assistant] model request failed", response.status);
    return null;
  }
  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content?.trim();
  return content || null;
}

function fallbackReply(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("تخفيض") || normalized.includes("عرض")) {
    return "أقدر أوجّهك لصفحة التخفيضات الرسمية، لكن تفاصيل العروض الحالية لازم تُراجع من المصدر مباشرة: https://baderabalkhail.com/offers";
  }
  if (normalized.includes("عود") || normalized.includes("خشب")) {
    return "عندك قسم «خشب العود» في المتجر الرسمي. ما عندي الآن كتالوج موصول يعرض أسماء المنتجات والأسعار بشكل مؤكد، لذلك الأفضل تشوف التفاصيل من هنا: https://baderabalkhail.com/-/c1168655920";
  }
  if (normalized.includes("عطر") || normalized.includes("عطور")) {
    return "قسم «العطور» موجود في متجر بدر أبا الخيل. أقدر أساعدك تضيق الاختيار حسب المناسبة والميزانية بعد ما نوصل بيانات المنتجات، وحاليًا هذا الرابط الرسمي: https://baderabalkhail.com/-/c898253916";
  }
  return "خلّني أساعدك. المعلومة الموثقة عندي الآن هي رابط متجر بدر أبا الخيل وأقسامه الرسمية. وش المناسبة أو النوع اللي تدور عليه؟";
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  assistant: router({
    ask: publicProcedure
      .input(z.object({
        message: z.string().trim().min(1).max(1200),
        history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) })).max(12).default([]),
      }))
      .mutation(async ({ input }) => ({
        reply: (await askModel(input.message, input.history)) ?? fallbackReply(input.message),
        source: hasVerifiedProductCatalog && process.env.MANUS_API_URL && process.env.MANUS_API_KEY ? "ai" : "verified-fallback",
      })),
  }),
});

export type AppRouter = typeof appRouter;
