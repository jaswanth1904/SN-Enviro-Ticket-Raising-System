import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';
import '../lib/features/ticket/bloc/ticket_bloc.dart';
import '../lib/features/ticket/data/ticket_repository.dart';
import '../lib/features/ticket/domain/ticket_model.dart';

// Generate Mock for TicketRepository
@GenerateMocks([TicketRepository])
import 'ticket_bloc_test.mocks.dart';

void main() {
  late MockTicketRepository mockRepository;
  late TicketBloc ticketBloc;

  setUp(() {
    mockRepository = MockTicketRepository();
    ticketBloc = TicketBloc(repository: mockRepository);
  });

  tearDown(() {
    ticketBloc.close();
  });

  group('TicketBloc', () {
    test('initial state is TicketInitial', () {
      expect(ticketBloc.state, TicketInitial());
    });

    blocTest<TicketBloc, TicketState>(
      'emits [TicketLoading, TicketSuccess] when submit is successful online',
      build: () {
        when(mockRepository.submitTicket(any)).thenAnswer((_) async => true);
        return ticketBloc;
      },
      act: (bloc) => bloc.add(SubmitTicketEvent(
        stationId: 'STN-101',
        subject: 'Test Subject',
        description: 'Test Desc',
      )),
      expect: () => [
        TicketLoading(),
        TicketSuccess(),
      ],
    );

    blocTest<TicketBloc, TicketState>(
      'emits [TicketLoading, TicketOfflineSaved] when submit acts offline',
      build: () {
        when(mockRepository.submitTicket(any)).thenAnswer((_) async => false);
        return ticketBloc;
      },
      act: (bloc) => bloc.add(SubmitTicketEvent(
        stationId: 'STN-101',
        subject: 'Test Subject',
        description: 'Test Desc',
      )),
      expect: () => [
        TicketLoading(),
        TicketOfflineSaved(),
      ],
    );
  });
}
