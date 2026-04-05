/**
 * Mock AI Client — template-based fallback (no API keys needed)
 * Extracted from the original hardcoded functions in server.js
 */

class MockAIClient {
  constructor() {
    this.name = 'mock';
  }

  async parsePrompt(promptText) {
    const lower = promptText.toLowerCase();

    let procedure = null;
    if (lower.includes('lasik')) procedure = 'LASIK';
    else if (lower.includes('cataract')) procedure = 'Cataract Surgery';
    else if (lower.includes('premium lens') || lower.includes('lens upgrade')) procedure = 'Premium Lens Upgrade';

    let campaignName = 'AI Generated Campaign';
    if (procedure) campaignName = `${procedure} Campaign`;
    if (lower.includes('summer')) campaignName = `Summer ${procedure || 'Vision'} Promotion`;
    if (lower.includes('spring')) campaignName = `Spring ${procedure || 'Vision'} Promotion`;
    if (lower.includes('fall') || lower.includes('autumn')) campaignName = `Fall ${procedure || 'Vision'} Promotion`;
    if (lower.includes('winter')) campaignName = `Winter ${procedure || 'Vision'} Promotion`;
    if (lower.includes('education')) campaignName = `${procedure || 'Vision'} Education Series`;
    if (lower.includes('special') || lower.includes('promo')) campaignName = `${procedure || 'Vision'} Special Promotion`;

    const now = new Date();
    let dateStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let dateEnd = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());

    const months = ['january','february','march','april','may','june','july','august','september','october','november','december'];
    const fromMatch = lower.match(/from\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})?/);
    const toMatch = lower.match(/(?:to|through|until)\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})?/);

    if (fromMatch) {
      const mi = months.indexOf(fromMatch[1]);
      const day = fromMatch[2] ? parseInt(fromMatch[2]) : 1;
      dateStart = new Date(now.getFullYear(), mi, day);
      if (dateStart < now) dateStart = new Date(now.getFullYear() + 1, mi, day);
    }
    if (toMatch) {
      const mi = months.indexOf(toMatch[1]);
      const day = toMatch[2] ? parseInt(toMatch[2]) : 28;
      dateEnd = new Date(now.getFullYear(), mi, day);
      if (dateEnd < dateStart) dateEnd = new Date(now.getFullYear() + 1, mi, day);
    }

    let minEngagement = 0;
    if (lower.includes('high engagement')) minEngagement = 70;
    else if (lower.includes('medium engagement')) minEngagement = 50;
    else if (lower.includes('engaged')) minEngagement = 60;

    return {
      campaignName,
      procedure,
      minEngagement,
      dateStart,
      dateEnd,
      segment: lower.includes('haven\'t converted') ? 'unconverted' : 'all',
    };
  }

  async generateEmail(patient, params, tone) {
    const procedure = params.procedure || patient.procedure_interest;
    const firstName = patient.first_name;
    const fullName = `${patient.first_name} ${patient.last_name}`;

    const subjects = {
      'Medical/Professional': `Important Information Regarding ${procedure} at nVision`,
      'Informative': `${procedure}: What You Need to Know`,
      'Friendly': `Hi ${firstName}, Let's Talk About Your ${procedure} Options`,
      'Casual': `${firstName}, Ready to See Clearer? 👓`,
      'Empathetic': `${firstName}, We Understand Your Vision Concerns`,
    };

    const intros = {
      'Medical/Professional': `Dear ${fullName},\n\nBased on your recent consultation regarding ${procedure}, we wanted to provide you with comprehensive information about this procedure.`,
      'Informative': `Hello ${fullName},\n\nThank you for your interest in ${procedure}. Here's what you should know about your options.`,
      'Friendly': `Hi ${firstName}!\n\nIt was great speaking with you about ${procedure}. I wanted to follow up with some helpful information.`,
      'Casual': `Hey ${firstName},\n\nSo you're thinking about ${procedure}? Let me break it down for you in simple terms.`,
      'Empathetic': `Dear ${firstName},\n\nWe know that considering ${procedure} is a big decision, and we're here to support you every step of the way.`,
    };

    const consultationRef = patient.consultation_notes
      ? `\n\nDuring your consultation, you mentioned ${patient.consultation_notes.substring(0, 100)}...`
      : '';

    const bodies = {
      'Medical/Professional': `${intros['Medical/Professional']}${consultationRef}\n\n${procedure} is a clinically proven procedure with a high success rate. Our board-certified ophthalmologists utilize state-of-the-art technology to ensure optimal outcomes.\n\nWe recommend scheduling a comprehensive evaluation to determine your candidacy and discuss the specific benefits relevant to your visual needs.\n\nPlease contact our office at your earliest convenience.\n\nSincerely,\nnVision Centers Medical Team`,
      'Informative': `${intros['Informative']}${consultationRef}\n\n${procedure} can significantly improve your vision and quality of life. The procedure typically takes 15-30 minutes, with most patients experiencing improved vision within 24-48 hours.\n\nKey benefits include:\n• Reduced dependence on glasses/contacts\n• Quick recovery time\n• Long-lasting results\n\nWe'd love to schedule a follow-up consultation to answer any questions.\n\nBest regards,\nThe nVision Team`,
      'Friendly': `${intros['Friendly']}${consultationRef}\n\nI know you had some great questions during our chat, and I wanted to make sure you have all the info you need to make the best decision for your eyes.\n\n${procedure} has helped thousands of people just like you achieve clearer vision. Imagine waking up and being able to see clearly without reaching for your glasses!\n\nWant to chat more? Just give us a call or reply to this email.\n\nLooking forward to hearing from you!\nYour friends at nVision`,
      'Casual': `${intros['Casual']}${consultationRef}\n\nLook, I get it - vision correction surgery sounds intimidating. But here's the thing: it's actually pretty straightforward, and the results are amazing.\n\nMost of our patients wish they'd done it sooner. Seriously.\n\nIf you're ready to ditch the glasses or contacts, let's make it happen. We're here to answer any questions, no pressure.\n\nShoot us a message anytime!\nThe nVision Crew`,
      'Empathetic': `${intros['Empathetic']}${consultationRef}\n\nWe understand that you may have concerns about the procedure, cost, or recovery time. These are completely normal feelings, and we're here to address each one.\n\nMany of our patients felt the same way you do now, and they're thrilled with their decision. We'll work with you to create a personalized plan that fits your needs and timeline.\n\nYou're not alone in this journey. Our caring team is here to support you.\n\nWarm regards,\nThe nVision Family`,
    };

    return {
      subject: subjects[tone] || subjects['Informative'],
      body: bodies[tone] || bodies['Informative'],
    };
  }

  async generateSMS(patient, params, tone) {
    const firstName = patient.first_name;
    const procedure = params.procedure || patient.procedure_interest;

    const messages = {
      'Informative': `Hi ${firstName}, this is nVision Centers. Ready to learn more about ${procedure}? We can answer all your questions. Reply YES for a callback.`,
      'Friendly': `Hey ${firstName}! 👋 It's nVision. Still thinking about ${procedure}? We'd love to chat and help you out. Text back anytime!`,
      'Casual': `${firstName}, quick question - still interested in clearer vision? ${procedure} could be perfect for you. Let's talk! Reply to connect.`,
    };

    return messages[tone] || messages['Friendly'];
  }

  async regenerateEmail(patient, params, tone, originalContent) {
    const base = await this.generateEmail(patient, params, tone);
    const variations = ['Additionally, ', 'Furthermore, ', 'Moreover, ', 'What\'s more, ', 'Also worth noting: '];
    const v = variations[Math.floor(Math.random() * variations.length)];

    return {
      subject: base.subject + ' (Updated)',
      body: base.body
        .replace('significantly', 'dramatically')
        .replace('comprehensive', 'thorough')
        .replace('optimal', 'excellent')
        .replace('great', 'wonderful')
        .replace('\n\n', `\n\n${v}`),
    };
  }

  async regenerateSMS(patient, params, tone, originalContent) {
    const base = await this.generateSMS(patient, params, tone);
    const emojis = ['✨', '💙', '👁️', '⭐'];
    const e = emojis[Math.floor(Math.random() * emojis.length)];
    return base.replace('?', `? ${e}`).replace('anytime', 'whenever').replace('Ready', 'Excited');
  }
}

module.exports = { MockAIClient };
