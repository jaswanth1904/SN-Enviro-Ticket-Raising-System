import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';
import 'package:dio/dio.dart';
import '../lib/features/ticket/data/ticket_repository.dart';
import '../lib/features/ticket/domain/ticket_model.dart';
import '../lib/core/network/api_client.dart';
import '../lib/core/network/network_info.dart';
import '../lib/core/storage/local_storage.dart';

@GenerateMocks([ApiClient, NetworkInfo, LocalStorage])
import 'ticket_repository_test.mocks.dart';

void main() {
  late MockApiClient mockApiClient;
  late MockNetworkInfo mockNetworkInfo;
  late MockLocalStorage mockLocalStorage;
  late TicketRepository repository;

  setUp(() {
    mockApiClient = MockApiClient();
    mockNetworkInfo = MockNetworkInfo();
    mockLocalStorage = MockLocalStorage();

    repository = TicketRepository(
      apiClient: mockApiClient,
      networkInfo: mockNetworkInfo,
      localStorage: mockLocalStorage,
    );
  });

  const tTicket = TicketModel(
    stationId: 'STN-200',
    subject: 'Faulty Sensor',
    description: 'Wire broke',
  );

  group('submitTicket', () {
    test('should save offline when there is no internet connection', () async {
      // Arrange
      when(mockNetworkInfo.isConnected).thenAnswer((_) async => false);

      // Act
      final result = await repository.submitTicket(tTicket);

      // Assert
      expect(result, false);
      verify(mockLocalStorage.saveOfflineTicket(any)).called(1);
      verifyNever(mockApiClient.post(any, data: anyNamed('data')));
    });

    test('should save offline when online but API throws 500 server crash', () async {
      // Arrange
      when(mockNetworkInfo.isConnected).thenAnswer((_) async => true);
      when(mockApiClient.post(any, data: anyNamed('data'))).thenThrow(
        DioException(
          requestOptions: RequestOptions(path: ''),
          response: Response(statusCode: 500, requestOptions: RequestOptions(path: '')),
        ),
      );

      // Act
      final result = await repository.submitTicket(tTicket);

      // Assert
      expect(result, false); // Returns false to indicate offline fallback happened
      verify(mockLocalStorage.saveOfflineTicket(any)).called(1);
    });

    test('should return true when online and API succeeds with 201', () async {
      // Arrange
      when(mockNetworkInfo.isConnected).thenAnswer((_) async => true);
      when(mockApiClient.post(any, data: anyNamed('data'))).thenAnswer(
        (_) async => Response(statusCode: 201, requestOptions: RequestOptions(path: '')),
      );

      // Act
      final result = await repository.submitTicket(tTicket);

      // Assert
      expect(result, true);
      verifyNever(mockLocalStorage.saveOfflineTicket(any));
    });
  });
}
