import json
from channels.consumer import AsyncConsumer
from channels.db import database_sync_to_async
# from help_center.components.legacy_app_helpers.users import models as user_model
#
# User = user_model

class ChatConsumer(AsyncConsumer):
    async def websocket_connect(self, event):
        print('++++++++++++++++++++++++++')
        print('connected', event)
        print('++++++++++++++++++++++++++')

        print('++++++++++++++++++++++++++')
        user = self.scope['path'][-2]
        print(user)
        print('++++++++++++++++++++++++++')

        # for key, value in event.items():
        #     print('connected', key, value)
        chat_room = f'user_chatroom_{user}'
        self.chat_room = chat_room
        await self.channel_layer.group_add(
            chat_room,
            self.channel_name
        )
        await self.send({
            'type': 'websocket.accept'
        })

    async def websocket_receive(self, event):
        print('receive', event)
        received_data = json.loads(event['text'])
        msg = received_data.get('message')
        msg_type = received_data.get('message_type')
        sent_by_id = received_data.get('sent_by')
        sent_to_id = received_data.get('send_to')
        channel = received_data.get('channel')
        call_type = received_data.get('call_type')
        if not msg_type:
            print('ERROR:: empty message')
            return False

        sent_by_user = sent_by_id
        sent_to_user = sent_to_id

        if not sent_by_user:
            print('ERROR:: send by user is incorrect')
        if not sent_to_user:
            print('ERROR:: send to user is incorrect')

        other_user_chat_room = f'user_chatroom_{sent_to_id}'
        self_user = sent_by_id

        response = {
            'message': msg,
            'message_type': msg_type,
            'sent_by': self_user,
            'send_to': sent_to_user,
            'channel': channel,
            'call_type': call_type
        }

        await self.channel_layer.group_send(
            other_user_chat_room,
            {
                'type': 'chat_message',
                'text': json.dumps(response)
            }
        )

        await self.channel_layer.group_send(
            self.chat_room,
            {
                'type': 'chat_message',
                'text': json.dumps(response)
            }
        )

    async def chat_message(self, event):
        print('chat_message', event)
        await self.send({
            'type': 'websocket.send',
            'text': event['text']
        })

    async def websocket_disconnect(self, event):
        print('++++++++++++++++++++++++++')
        print('disconnected', event)
        print('++++++++++++++++++++++++++')