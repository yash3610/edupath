import React from "react";

const faqs = [
  "What are the benefits of education?",
  "How can I find the program for me?",
  "Can I get financial for my education?",
];

export default function FaqSection() {
  return (
    <section className="ep-faq ep-faq--style2 section-gap pt-0 position-relative">
      <div className="ep-faq__pattern-3 updown-ani"><img src="/assets/images/faq/faq-2/pattern.svg" alt="pattern" /></div>
      <div className="container ep-container">
        <div className="row">
          <div className="col-12">
            <div className="ep-section-head ep-section-head--style2">
              <h3 className="ep-section-head__color-title ep7-color ep7-border-color">8.some Faq</h3>
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
                {faqs.map((question, index) => (
                  <div className="ep-faq__accordion-item ep-faq__accordion-item--style2" key={question}>
                    <h2 className="accordion-header">
                      <button className={`accordion-button ${index ? "collapsed" : ""}`} type="button">
                        <span>{String(index + 1).padStart(2, "0")}</span>{question}
                      </button>
                    </h2>
                    <div className={`accordion-collapse collapse ${index ? "" : "show"}`}>
                      <div className="ep-faq__accordion-body">
                        <p className="ep-faq__accordion-text">The generated is therefore always free from repetition and injected humour or words.</p>
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
