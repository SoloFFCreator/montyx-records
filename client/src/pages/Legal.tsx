import { PageIntro, usePageMeta } from "@/components/SiteLayout";

const copy: Record<
  string,
  {
    kicker: string;
    title: string;
    intro: string;
    sections: Array<[string, string]>;
  }
> = {
  privacy: {
    kicker: "INFORMATION",
    title: "Privacy policy",
    intro:
      "This policy describes information submitted through the MONTYX RECORDS website. Review and update it before expanding the site’s data practices.",
    sections: [
      [
        "Information collected",
        "When you use the contact form, we collect your name, email address, subject and message. A one-way, salted network identifier is stored with the submission for rate-limiting. We do not request passwords, payment details or music files through the form.",
      ],
      [
        "How we use it",
        "Contact details are used to review and respond to the enquiry and to protect the form against repeated automated submissions. Contact submissions are visible only to authorized label administrators.",
      ],
      [
        "Retention and deletion",
        "Messages are retained until they are no longer needed for the enquiry or legitimate record-keeping. To request access, correction or deletion, use the contact form and identify the message you sent. Deletion requests are reviewed by an authorized administrator.",
      ],
      [
        "Services and changes",
        "The website’s hosting, authentication and managed database may process technical data to provide the service. This draft policy does not assert legal compliance that has not been verified. It may be updated as the site’s services and applicable requirements are reviewed.",
      ],
    ],
  },
  terms: {
    kicker: "INFORMATION",
    title: "Website terms",
    intro:
      "These editable terms describe basic use of this site. They do not replace the terms of any music or streaming service.",
    sections: [
      [
        "Using this website",
        "You may browse public label information and use the contact form for lawful enquiries. Do not attempt to access administrative areas, disrupt the website, submit harmful content or misrepresent your authority.",
      ],
      [
        "Music and third-party services",
        "Music rights and permissions depend on the applicable ownership and licensing agreements. A link to a third-party streaming or social platform leads to a service governed by that service’s own terms, privacy policy and availability.",
      ],
      [
        "Artist ownership",
        "These terms do not transfer ownership of any artist’s music to MONTYX RECORDS. Artists retain master ownership unless a separate written agreement states otherwise. The label only distributes or promotes recordings under rights and permissions actually obtained.",
      ],
      [
        "Updates",
        "The label may update the website and these terms. This is a general website-use statement, not a claim that the label is a registered company or that the text has been reviewed for every jurisdiction.",
      ],
    ],
  },
  rights: {
    kicker: "MUSIC & RIGHTS",
    title: "Copyright and rights",
    intro:
      "Music rights depend on the specific ownership and licensing agreements that apply to each recording.",
    sections: [
      [
        "Master ownership",
        "Artists retain ownership of their master recordings unless a separate written agreement states otherwise. The appearance of the MONTYX RECORDS name in release metadata does not by itself establish ownership of a recording.",
      ],
      [
        "Distribution and promotion",
        "MONTYX RECORDS respects artists’ master ownership and only distributes or promotes recordings under the rights and permissions it has obtained. A release is not represented as live or distributed until its status has been confirmed by an authorized administrator.",
      ],
      [
        "Rights enquiries and takedowns",
        "For a good-faith rights inquiry or takedown request, contact the label through the contact form. Include the recording or URL, the rights or basis of the request, and a way to reach you. Do not submit sensitive personal information unless needed to identify the claim.",
      ],
      [
        "Specific agreements",
        "Any separate written agreement controls the rights it expressly covers. Contact the label to discuss a particular recording; this page does not substitute for an agreement or legal advice.",
      ],
    ],
  },
};

export default function Legal({
  page,
}: {
  page: "privacy" | "terms" | "rights";
}) {
  const data = copy[page];
  usePageMeta(
    `${data.title} — MONTYX RECORDS`,
    `${data.title} for the MONTYX RECORDS website.`
  );
  return (
    <main>
      <PageIntro kicker={data.kicker} title={data.title} intro={data.intro} />
      <section className="legal-content content-width">
        {data.sections.map(([heading, text], i) => (
          <article key={heading} className="legal-section">
            <span className="legal-number">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h2>{heading}</h2>
              <p>{text}</p>
            </div>
          </article>
        ))}
        <p className="legal-updated">
          Website information should be reviewed and updated by the label owner
          as operations change.
        </p>
      </section>
    </main>
  );
}
