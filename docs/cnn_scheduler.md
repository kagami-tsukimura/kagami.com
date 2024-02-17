学習率スケジューラを実装するためには、トレーニングループ内でスケジューラによって定期的に呼び出される必要があります。  
以下に、提案された変更を含むコードを示します。  
このコードは、毎エポックごとにスケジューラを呼び出す例です。

```python
import torch.optim.lr_scheduler

# ... 既存のコード ...

class CNNTrainer:
    # ... 既存のメソッドと初期化 ...

    def train_cnn(self, optimizer, scheduler, criterion, best_valid_loss):
        CHECKPOINT = self.config["CNN"]["checkpoint"]
        CHECKPOINT_DIR = Path(f"{self.save_dir}/checkpoints")
        CHECKPOINT_DIR.mkdir(parents=True, exist_ok=True)

        for epoch in range(self.EPOCHS):
            # 学習率スケジューラを毎エポックごとに呼び出す
            scheduler.step()

            train_loss, train_acc = self.train(
                model, self.device, train_iterator, optimizer, criterion
            )
            valid_loss, valid_acc = self.evaluate(
                model, self.device, valid_iterator, criterion
            )

            if valid_loss < best_valid_loss:
                best_valid_loss = valid_loss
                torch.save(model.state_dict(), self.MODEL_SAVE_PATH)
            torch.save(model.state_dict(), self.MODEL_SAVE_PATH2)

            # checkpointの保存
            if (epoch + 1) % CHECKPOINT == 0:
                checkpoint_path = (
                    CHECKPOINT_DIR
                    / f"epoch-{epoch+1}-{self.config['CNN']['backborn']}-{self.config['CNN']['mode']}-{self.config['CNN']['classification']}cls.pt"
                )
                torch.save(model.state_dict(), checkpoint_path)

            print(
                f"| Epoch: {epoch+1:02} | Train Loss: {train_loss:.3f} | Train Acc: {train_acc*100:.2f}% | Val. Loss: {valid_loss:.3f} | Val. Acc: {valid_acc*100:.2f}% |"  # noqa
            )

            log_metric("Train Loss", f"{train_loss:.3f}", epoch + 1)
            log_metric("Train Acc", f"{train_acc*100:.2f}", epoch + 1)
            log_metric("Val. Loss", f"{valid_loss:.3f}", epoch + 1)
            log_metric("Val. Acc", f"{valid_acc*100:.2f}", epoch + 1)

# ... 既存のメソッドとクラス ...

if __name__ == "__main__":
    args = parse_arguments()
    train_cnn = CNNTrainer(args.config)
    set_experiment(train_cnn.config["EXPERIMENTS"]["mlflow"])
    with start_run(run_name=train_cnn.config["EXPERIMENTS"]["ver"]) as run:
        train_transforms, test_transforms = train_cnn.prepare_transform()
        train_data, valid_data, test_data = train_cnn.load_data()
        train_iterator, valid_iterator, test_iterator = train_cnn.shuffle_data(
            train_data, valid_data, test_data
        )
        model = train_cnn.build_model()
        optimizer, criterion, best_valid_loss, cls_weights = train_cnn.adjust_weights(
            model
        )

        # 学習率スケジューラを設定
        scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=5, gamma=0.1)

        train_cnn.log_params(cls_weights)

        # Load checkpoint if specified
        if args.checkpoint_path:
            model.load_state_dict(torch.load(args.checkpoint_path))
            print(f"Resume training from checkpoint: {args.checkpoint_path}")

        # 学習率スケジューラをtrain_cnnメソッドに渡す
        train_cnn.train_cnn(optimizer, scheduler, criterion, best_valid_loss)
        train_cnn.evaluate_models()
        cnn_transforms = train_cnn.transform_for_cnn()
        cnn_model = train_cnn.create_cnn_model()
        train_cnn.save_prediction(cnn_transforms, cnn_model)
```

このコードでは、`torch.optim.lr_scheduler.StepLR`を使用していますが、他にもいくつかのスケジューラが利用可能です。  
必要に応じて調整してください。
