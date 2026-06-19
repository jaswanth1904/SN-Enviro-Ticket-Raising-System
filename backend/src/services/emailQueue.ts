import { sendEmail } from './emailService';

interface EmailTask {
  to: string;
  subject: string;
  htmlContent: string;
}

class EmailQueue {
  private queue: EmailTask[] = [];
  private isProcessing: boolean = false;

  public async push(task: EmailTask) {
    this.queue.push(task);
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue() {
    this.isProcessing = true;
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        try {
          await sendEmail(task.to, task.subject, task.htmlContent);
        } catch (error) {
          console.error('Error processing email task:', error);
          // In a real robust queue like BullMQ, we'd handle retries here.
        }
      }
    }
    this.isProcessing = false;
  }
}

export const emailQueue = new EmailQueue();
