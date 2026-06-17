import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/network/api_client.dart';

// Events
abstract class AuthEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class LoginRequested extends AuthEvent {
  final String email;
  final String password;
  LoginRequested(this.email, this.password);

  @override
  List<Object?> get props => [email, password];
}

class LogoutRequested extends AuthEvent {}
class CheckAuthStatus extends AuthEvent {}

// States
abstract class AuthState extends Equatable {
  @override
  List<Object?> get props => [];
}

class AuthInitial extends AuthState {}
class AuthLoading extends AuthState {}
class AuthAuthenticated extends AuthState {}
class AuthUnauthenticated extends AuthState {}
class AuthError extends AuthState {
  final String message;
  AuthError(this.message);

  @override
  List<Object?> get props => [message];
}

// BLoC
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final ApiClient apiClient;
  final FlutterSecureStorage secureStorage;

  AuthBloc({required this.apiClient, required this.secureStorage}) : super(AuthInitial()) {
    on<CheckAuthStatus>((event, emit) async {
      final token = await secureStorage.read(key: 'jwt_token');
      if (token != null) {
        emit(AuthAuthenticated());
      } else {
        emit(AuthUnauthenticated());
      }
    });

    on<LoginRequested>((event, emit) async {
      emit(AuthLoading());
      try {
        final response = await apiClient.post('/auth/login', data: {
          'email': event.email,
          'password': event.password,
        });

        if (response.statusCode == 200 && response.data['success']) {
          final token = response.data['data']['token'];
          await secureStorage.write(key: 'jwt_token', value: token);
          emit(AuthAuthenticated());
        } else {
          emit(AuthError('Invalid credentials'));
        }
      } catch (e) {
        emit(AuthError('Network error or server unreachable.'));
      }
    });

    on<LogoutRequested>((event, emit) async {
      await secureStorage.delete(key: 'jwt_token');
      emit(AuthUnauthenticated());
    });
  }
}
