from firebase_admin import auth


class AuthService:

    @staticmethod
    def verify_token(id_token: str):

        decoded_token = auth.verify_id_token(
            id_token
        )

        return decoded_token