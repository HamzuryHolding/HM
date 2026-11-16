from pathlib import Path
import re,html
from reportlab.platypus import BaseDocTemplate,PageTemplate,Frame,Paragraph,Spacer,PageBreak,KeepTogether,Flowable,Image
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
D=Path(__file__).parent
pdfmetrics.registerFont(TTFont('Book','/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'))
pdfmetrics.registerFont(TTFont('BookBold','/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Sans','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('SansBold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
pdfmetrics.registerFontFamily('Book',normal='Book',bold='BookBold',italic='Book',boldItalic='BookBold')
W,H=504,720; brown=HexColor('#29150e');gold=HexColor('#b38c52');cream=HexColor('#f7f2e9');ink=HexColor('#35271e')
styles={
 'body':ParagraphStyle('body',fontName='Book',fontSize=10,leading=14.5,spaceAfter=9,textColor=ink),
 'chapter':ParagraphStyle('chapter',fontName='Book',fontSize=25,leading=31,spaceAfter=24,textColor=brown,keepWithNext=True),
 'sub':ParagraphStyle('sub',fontName='SansBold',fontSize=11,leading=16,spaceBefore=13,spaceAfter=9,textColor=brown,keepWithNext=True),
 'label':ParagraphStyle('label',fontName='SansBold',fontSize=8,leading=12,spaceAfter=12,textColor=gold,tracking=1,keepWithNext=True),
 'small':ParagraphStyle('small',fontName='Sans',fontSize=8,leading=12,spaceAfter=8,textColor=ink),
 'white':ParagraphStyle('white',fontName='Sans',fontSize=11,leading=17,textColor=cream,spaceAfter=16),
 'cover':ParagraphStyle('cover',fontName='Book',fontSize=34,leading=43,textColor=cream,spaceAfter=22),
}
def esc(t):return html.escape(t.replace('—',' - ').replace('–','-'))
def p(t,style='body'):return Paragraph(esc(t),styles[style])
class Lines(Flowable):
 def __init__(self,n=3):super().__init__();self.n=n;self.width=408;self.height=n*21+7
 def draw(self):
  self.canv.setStrokeColor(HexColor('#d8cbb7'));self.canv.setLineWidth(.45)
  for i in range(self.n):self.canv.line(0,21*i+10,408,21*i+10)
class BookDoc(BaseDocTemplate):
 def __init__(self,path):
  super().__init__(path,pagesize=(W,H),leftMargin=48,rightMargin=48,topMargin=47,bottomMargin=48,title='ASSSS: From Questions to Useful Action',author='Haruna Muhammad (hm hamzury)',subject='Complete first-edition manuscript - In review',allowSplitting=True)
  self.addPageTemplates(PageTemplate(id='book',frames=[Frame(48,48,408,625,id='main',leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)],onPage=self.page))
 def page(self,c,doc):
  c.saveState()
  if doc.page==1:
   c.setFillColor(brown);c.rect(0,0,W,H,stroke=0,fill=1)
   c.setStrokeColor(gold);c.setLineWidth(.7);c.rect(22,22,W-44,H-44,stroke=1,fill=0)
   c.setFillColor(gold);c.setFont('SansBold',9);c.drawString(48,55,'AWARENESS / STRATEGY / STRUCTURE')
   c.drawString(48,39,'SYSTEMS / SUCCESS')
  else:
   c.setFillColor(cream);c.rect(0,0,W,H,stroke=0,fill=1)
   c.setFont('Sans',7);c.setFillColor(gold);c.drawString(48,H-28,'hm hamzury / ASSSS')
   c.setStrokeColor(HexColor('#d8cbb7'));c.line(48,35,W-48,35)
   c.setFillColor(ink);c.setFont('Sans',6.6);c.drawString(48,23,'FIRST EDITION / IN REVIEW');c.drawRightString(W-48,23,str(doc.page))
  c.restoreState()
 def afterFlowable(self,f):
  if getattr(f,'toc',None):
   key='s'+str(f.toc[0]);self.canv.bookmarkPage(key);self.canv.addOutlineEntry(f.toc[1],key,0,False);self.notify('TOCEntry',(0,f.toc[1],self.page,key))
story=[Spacer(1,18),p('hm hamzury','white'),Spacer(1,32),Paragraph('ASSSS',ParagraphStyle('big',fontName='SansBold',fontSize=57,leading=68,textColor=gold,spaceAfter=22)),p('From Questions<br/>to Useful Action'.replace('<br/>','\n'),'cover'),p('A practical philosophy for understanding problems and building lasting results','white'),Spacer(1,25),p('Haruna Muhammad','white'),Spacer(1,15),p('COMPLETE FIRST-EDITION MANUSCRIPT\nIN REVIEW / NOVEMBER 2026','white'),PageBreak()]
# Rights and editorial status page
story += [p('EDITION NOTE','label'),p('A living body of work.','chapter'),p('ASSSS: From Questions to Useful Action'),p('Haruna Muhammad / hm hamzury'),p('First edition, prepared 7 November 2026. Complete manuscript for author review. No external peer review or scientific validation is claimed.'),p('Copyright © 2026 Haruna Muhammad. Except for the personal and non-commercial classroom worksheet use described in this book, permission is required for reproduction or adaptation beyond applicable legal exceptions.'),p('All teaching scenarios and their numbers are illustrative unless expressly stated otherwise. They are not documented outcomes of Hamzury Holding, RIDLI or any named programme.'),p('Prepared with AI-assisted drafting and editorial support. The author should review the manuscript before describing it as a final approved edition.'),p('Contact: hm@hamzury.com\nPublic identity: @hmhamzury'),PageBreak()]
story += [p('CONTENTS','label'),p('The path through the book.','chapter')]
story[-1].keepWithNext=False
toc=TableOfContents();toc.levelStyles=[ParagraphStyle('toc',fontName='Sans',fontSize=9,leading=13,spaceBefore=5,leftIndent=0,firstLineIndent=0,rightIndent=22,textColor=ink)];story.append(toc)
sections=re.split(r'^@@ ',(D/'manuscript.md').read_text(),flags=re.M)[1:]
idx=0
for section in sections:
 title,body=section.split('\n',1);idx+=1;story.append(PageBreak())
 if re.match(r'\d\d /',title):
  num,titletext=title.split(' / ',1);story.append(p('CHAPTER '+num,'label'))
 else:titletext=title;story.append(p('ASSSS / READER’S EDITION','label'))
 h=p(titletext,'chapter');h.toc=(idx,title);story.append(h)
 for block in re.split(r'\n\s*\n',body.strip()):
  if block.startswith('### '):
   bits=block[4:].split('\n',1);story.append(p(bits[0],'sub'))
   if len(bits)>1:story.append(p(bits[1].replace('\n',' ')))
  else:story.append(p(block.replace('\n',' ')))
# Workbook divider + complete worked example
idx+=1;story.append(PageBreak());story.append(p('WORKBOOK','label'));h=p('A complete cycle.','chapter');h.toc=(idx,'Workbook / A worked example and six reusable sheets');story.append(h)
story += [p('The following example shows a complete small cycle. It is fictional. Its numbers demonstrate how to keep a decision record; they are not evidence for the effectiveness of ASSSS.'),p('Worked example / A clearer enquiry response','sub'),p('Situation: A small workshop receives enquiries about its introductory course. People often ask the same questions and then stop replying. The team wants to test whether a clearer first response helps people decide.'),p('Awareness','sub'),p('In this invented case, the team reviews ten recent enquiries. Six ask follow-up questions about dates or required equipment. Two people who decline say the timing does not work for them. The team distinguishes an information gap from a scheduling barrier; it does not assume one response will solve both.'),p('Strategy','sub'),p('For the next ten enquiries, the team will use one short reply explaining the course, schedule, equipment needs, verified fee and next step. The schedule itself will stay unchanged during this test. The reply will ask whether the timing and requirements suit the enquirer.'),p('The team will record whether people understand the next step and whether clarification is still needed. It will stop using the new reply if it creates confusion or contains an inaccurate promise.'),PageBreak(),p('WORKED EXAMPLE / CONTINUED','label'),p('Structure','sub'),p('One coordinator owns the reply and enquiry log. The programme lead verifies dates, requirements and the fee before use. A colleague checks that a new reader can explain the offer back. Questions outside the agreed information go to the programme lead.'),p('Systems','sub'),p('The trigger is a new enquiry. The coordinator records the question, sends the verified reply, notes any clarification, assigns the next action and records the outcome. An enquiry without a reply is marked unresolved, not silently counted as rejection.'),p('Success','sub'),p('In the fictional test, three of ten enquiries need clarification about dates or equipment, compared with six of ten in the earlier sample. Two still report a scheduling conflict. This is a small, non-comparable sample, so the team cannot establish that the wording caused the change.'),p('Decision','sub'),p('Keep the clearer reply for another review cycle, verify that the information remains accurate and investigate scheduling separately. Do not claim that conversion, attendance or learning improved unless those outcomes are measured.'),p('What this example teaches','sub'),p('A complete cycle does not require a dramatic result. It requires a clear question, an explicit choice, workable responsibilities, a process and an honest review. The unresolved scheduling issue becomes the next awareness question.')]
worksheets=[
('01 / Situation brief','Awareness: separate observation from interpretation.', [('The situation, people affected and period',3),('What the records or observations show',3),('My explanation and one plausible alternative',3),('The most important unknown and how I will investigate it',3)]),
('02 / Strategy test','Strategy: choose a bounded response.', [('The change we want and how we will recognise it',2),('Two possible responses and their trade-offs',3),('Chosen test, participants and start / end dates',3),('Stop or revise conditions; work we are deferring',3)]),
('03 / Responsibility map','Structure: make ownership and capacity visible.', [('Deliverable and what “done” means',3),('Owner, contributors and reviewer',2),('Time, resources and missing capacity',3),('Decision boundaries, handover location and fallback',3)]),
('04 / Process card','Systems: make the next action repeatable.', [('Trigger, owner and required inputs',2),('The main steps, in order',5),('Completion check and record location',2),('Exception route and person to contact',2)]),
('05 / Results review','Success: use evidence to choose the next move.', [('Intended change, baseline and observed result',3),('Costs, limitations and uneven experiences',3),('What the evidence supports; what it does not establish',2),('Continue, adapt, pause or stop: decision, owner and date',3)]),
('06 / My next 30 days','A flexible rhythm for one complete cycle.', [('Week 1: understand the situation and key uncertainty',3),('Week 2: choose a test and organise the work',3),('Week 3: run the process and keep useful records',3),('Week 4: review, decide and share the lesson',3)])]
for title,intro,fields in worksheets:
 story+=[PageBreak(),p('REUSABLE WORKSHEET','label'),p(title,'chapter'),p(intro,'small')]
 for question,n in fields:story += [p(question,'small'),Lines(n)]
# Glossary and final author page
idx+=1;story +=[PageBreak(),p('REFERENCE','label')];h=p('A small working glossary.','chapter');h.toc=(idx,'Glossary / Terms used in the book');story.append(h)
terms=[('Assumption','An explanation or expectation being used before it has enough support.'),('Baseline','A recorded starting condition used to interpret later observations.'),('Evidence','Information that can support or challenge a particular claim.'),('Indicator','A defined signal used to observe part of a situation or result.'),('Output','Something produced by an activity, such as a completed project.'),('Outcome','A change that follows, such as being able to use a skill independently.'),('Impact','A broader or longer-term effect; establishing contribution or causation requires care.'),('Pilot','A limited trial used to learn before making a larger commitment.'),('System','A repeatable arrangement of people, steps, information and feedback.'),('Trade-off','A benefit accepted alongside a cost, limitation or foregone alternative.')]
for term,meaning in terms:story += [p(term,'sub'),p(meaning)]
idx+=1;story += [PageBreak(),p('ABOUT THE AUTHOR','label')];h=p('Haruna Muhammad','chapter');h.toc=(idx,'About the author & continuing the conversation');story.append(h)
portrait=D.parents[1]/'src/assets/official-portrait.jpeg'
if portrait.exists():story += [Image(str(portrait),width=125,height=125,hAlign='LEFT'),Spacer(1,20)]
story += [p('Known as hm hamzury, Haruna Muhammad is the founder of Hamzury Holding, chairman of RIDLI and developer of the ASSSS framework. His work brings together entrepreneurship, practical learning, technology and community engagement.'),p('This book presents his developing approach to clearer thinking and useful action. It invites readers to apply, question and improve the method rather than accept it as a finished theory.'),p('For feedback, teaching enquiries and collaboration:\nhm@hamzury.com'),p('When sharing feedback, describe the situation, the part of the framework you used, what happened and where the method fell short. Please avoid sending confidential personal or client information.'),Spacer(1,12),p('Awareness. Strategy. Structure. Systems. Success.','sub'),p('Understand deeply. Build meaningfully.','body')]
BookDoc(str(D.parents[1]/'src/downloads/ASSSS_From_Questions_to_Useful_Action_In_Review.pdf')).multiBuild(story)
print('Built book PDF')
