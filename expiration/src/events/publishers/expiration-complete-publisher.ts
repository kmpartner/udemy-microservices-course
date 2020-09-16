import { Subjects, Publisher, ExpirationCompleteEvent } from '@sgtickets/common';

export class ExpirationCompletePublisher extends Publisher<
  ExpirationCompleteEvent
> {
  subjects: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}