import React from "react";

const faqs = [
  {
    question: "What are the benefits of learning on EduPath?",
    answer: "EduPath gives you structured courses, recorded lessons, quizzes, assignments, live classes, and progress tracking in one place. You can learn at your own pace and continue from where you stopped.",
  },
  {
    question: "How can I find the right course for me?",
    answer: "Browse courses by category and level, then review the curriculum, instructor, duration, and learning outcomes. Choose a beginner course if you are starting fresh or an advanced course to build deeper practical skills.",
  },
  {
    question: "Are flexible payment options available?",
    answer: "Available offers and payment options are shown during checkout. Course pricing, discounts, and included resources are displayed clearly before you complete your enrollment.",
  },
];

export default function FaqSection() {
  return (
    <section className="ep-faq ep-faq--style2 section-gap pt-0 position-relative">
      <div className="ep-faq__pattern-3 updown-ani"><img src="/assets/images/faq/faq-2/pattern.svg" alt="pattern" /></div>
      <div className="container ep-container">
        <div className="row">
          <div className="col-12">
            <div className="ep-section-head ep-section-head--style2">
              <h3 className="ep-section-head__color-title ep7-color ep7-border-color">Common Questions</h3>
            </div>
          </div>
        </div>
        <div className="row g-0 align-items-center">
          <div className="col-lg-6 col-12">
            <div className="ep-faq__img"><img src="/assets/images/faq/faq-2/faq-img.png" alt="faq-img" /></div>
          </div>
          <div className="col-lg-6 col-12">
            <div className="ep-faq__content">
              <div className="ep-section-head">
                <h3 className="ep-section-head__big-title fs-28 ep-split-text left">Frequently Asked Questions and Answers <br />Find Solutions</h3>
              </div>
              <div className="ep-faq__accordion faq-inner accordion" id="accordionExample">
                {faqs.map((faq, index) => (
                  <div className="ep-faq__accordion-item ep-faq__accordion-item--style2" key={faq.question}>
                    <h2 className="accordion-header">
                      <button className={`accordion-button ${index ? "collapsed" : ""}`} type="button">
                        <span>{String(index + 1).padStart(2, "0")}</span>{faq.question}
                      </button>
                    </h2>
                    <div className={`accordion-collapse collapse ${index ? "" : "show"}`}>
                      <div className="ep-faq__accordion-body">
                        <p className="ep-faq__accordion-text">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
