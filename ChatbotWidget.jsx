import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./ChatbotWidget.css";

const QUICK = ["실시간 스코어", "경기 결과", "경기 일정", "선수 기록", "팀 순위"];

const QUICK_RESPONSE = {
  "실시간 스코어": `⚾ 지금 경기 상황이에요!

5회말
기아 3 : 2 삼성
`,

  "경기 결과": `⚾ 경기 결과에요!

9회말 (경기 종료)
기아 6 : 4 삼성
`,

  "경기 일정": `📅 오늘의 경기 일정이에요!

18:30
기아 vs 삼성
(광주 기아챔피언스필드)
`,

  "선수 기록": `📊 주요 선수 기록이에요!

김도영
타율 0.328 / 홈런 18 / 타점 62
`,

  "팀 순위": `🏆 현재 팀 순위에요!

1위 기아 타이거즈
승률 0.612
`,
};

const FAQ_RULES = [
  {
    test: /(기아|KIA|기아타이거즈).*(색|색깔|컬러)|(?:색|색깔|컬러).*(기아|KIA|기아타이거즈)/i,
    reply:
      `🔴 기아 타이거즈의 상징색은 **빨간색**이에요!\n\n` +
      `이 빨간색은 팀과 팬의 **뜨거운 열정**을 상징하고,\n` +
      `과거 **해태 타이거즈 시절부터 이어진 정통성**과 아이덴티티를 계승하는 의미로\n` +
      `오랫동안 팀의 대표 컬러로 사용돼 왔어요.`,
  },

  // 예시로 한두 개 더 추가해둘 수도 있어
  {
    test: /(기아|KIA).*(연고지|홈|구장)|홈구장/i,
    reply: `🏟️ 기아 타이거즈의 홈구장은 **광주 기아챔피언스필드**예요!`,
  },

    {
    test: /(기아|KIA).*(양현종|현종)|양현종선수/i,
    reply: `기아타이거즈 양현종 선수는 1988년 3월 1일 생으로 광주광역시에서 태어난 선수에요! \n` +
    `2007년에 프로에 입단하여 2020년까지 기아타이거즈의 유명한 에이스 선발투수로 자리잡고 있었고\n` + 
    `2021년 MLB 텍사스 레인저스에 입단했다가 1년 후에 2022년 기아타이거즈로 돌아온\n` + 
    `기아타이거즈의 자부심이자 에이스인 선수 입니다!`,
  },
];

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "bot", text: "제가 도와드릴게 있나요? 편하게 말씀해주시면 답변해드릴게요." },
  ]);

  const bodyRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      bodyRef.current?.scrollTo({
        top: bodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [open, messages]);

  const getReply = (text) => {
    // 1) 퀵 버튼 우선
    if (QUICK_RESPONSE[text]) return QUICK_RESPONSE[text];

    // 2) 규칙 기반 매칭
    for (const rule of FAQ_RULES) {
      if (rule.test.test(text)) return rule.reply;
    }

    // 3) fallback
    return `🤖 아직은 데모라서 일부 질문만 답변할 수 있어요.\n\n예) "기아타이거즈 상징색", "홈구장", "경기 일정" 처럼 물어봐 주세요!`;
  };


  // 더미 응답 (패킷이 주고 받고가 되는지 전송 테스트용
  const send = (text) => {
    const t = (text ?? input).trim();
    if (!t) return;

    // 입력창 비우기
    setInput("");

    // 유저 클릭 메시지
    setMessages((prev) => [
      ...prev,
      { role: "user", text: t },
    ]);

    // 인덱스별 챗봇 응답
    const reply = getReply(t);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: reply },
      ]);
    }, 400); // 살짝 딜레이 → AI 느낌
  };

  return createPortal(
    <>
      {/* 챗봇 Open 부분 */}
      {!open && (
        <button className="cb-fab" onClick={() => setOpen(true)} aria-label="챗봇 열기">
          도움
        </button>
      )}

      {/* 패널 */}
      {open && (
        <div className="cb-panel" role="dialog" aria-label="챗봇">
          <div className="cb-head">
            <span className="cb-title">챗봇</span>
            <button className="cb-close" onClick={() => setOpen(false)} aria-label="닫기">
              ✕
            </button>
          </div>

          <div className="cb-body" ref={bodyRef}>
            <div className="cb-date">2026.01.18 (일)</div>

            {messages.map((m, idx) => (
              <div key={idx} className={`cb-msg ${m.role === "user" ? "is-user" : "is-bot"}`}>
                <div className="cb-bubble">{m.text}</div>
              </div>
            ))}
          </div>

          <div className="cb-quick">
            {QUICK.map((q) => (
              <button key={q} className="cb-chip" onClick={() => send(q)}>
                {q}
              </button>
            ))}
          </div>

          <div className="cb-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="무엇이든 물어보세요"
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
            />
            <button onClick={() => send(input)}>전송</button>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}